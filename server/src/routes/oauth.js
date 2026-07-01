import { Router } from "express";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import { prisma } from "../db.js";
import { establishSession } from "../session.js";

const router = Router();

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const OAUTH_TTL_MS = 10 * 60 * 1000; // 인가 흐름 유효시간 10분

// OAuth 엔드포인트 남용 방지(IP당 15분 30회)
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." },
});

const providers = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scope: "openid email profile",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    parseProfile: (u) => ({
      providerId: String(u.id),
      username: u.name || (u.email ? u.email.split("@")[0] : ""),
      email: u.email || null,
    }),
  },
  kakao: {
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    userInfoUrl: "https://kapi.kakao.com/v2/user/me",
    scope: "",
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    parseProfile: (u) => ({
      providerId: String(u.id),
      username: u?.kakao_account?.profile?.nickname || `kakao_${u.id}`,
      email: u?.kakao_account?.email || null,
    }),
  },
};

// --- PKCE / state 유틸 ---
function base64url(buf) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function makeVerifier() {
  return base64url(crypto.randomBytes(32));
}
function challengeFor(verifier) {
  return base64url(crypto.createHash("sha256").update(verifier).digest());
}
function makeState() {
  return crypto.randomBytes(32).toString("hex");
}

function redirectUri(name) {
  return `${SERVER_URL}/api/auth/oauth/${name}/callback`;
}

// 인증 응답은 캐시 금지
function noStore(res) {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
}

// GET /api/auth/oauth/status — 설정된 제공자 안내
router.get("/status", (_req, res) => {
  res.json({
    google: Boolean(providers.google.clientId),
    kakao: Boolean(providers.kakao.clientId),
  });
});

// GET /api/auth/oauth/:provider — 제공자 인증 페이지로 리디렉트(PKCE + state)
router.get("/:provider", oauthLimiter, (req, res) => {
  const name = req.params.provider;
  const p = providers[name];
  if (!p) return res.status(404).json({ error: "지원하지 않는 로그인 제공자입니다." });
  if (!p.clientId) {
    return res.redirect(`${CLIENT_ORIGIN}/login?error=${name}_not_configured`);
  }
  noStore(res);

  const state = makeState();
  const codeVerifier = makeVerifier();

  // 한 번의 인가 흐름에 대한 단일 상태(1회용)를 세션에 저장
  req.session.oauth = {
    provider: name,
    state,
    codeVerifier,
    expiresAt: Date.now() + OAUTH_TTL_MS,
  };

  const params = new URLSearchParams({
    client_id: p.clientId,
    redirect_uri: redirectUri(name),
    response_type: "code",
    state,
    code_challenge: challengeFor(codeVerifier),
    code_challenge_method: "S256",
  });
  if (p.scope) params.set("scope", p.scope);

  res.redirect(`${p.authUrl}?${params.toString()}`);
});

// GET /api/auth/oauth/:provider/callback — 인가코드 처리
router.get("/:provider/callback", oauthLimiter, async (req, res) => {
  const name = req.params.provider;
  const p = providers[name];
  noStore(res);
  const fail = (reason) =>
    res.redirect(`${CLIENT_ORIGIN}/login?error=${reason}`);

  // 1회용 상태를 즉시 소비(재사용 방지)
  const saved = req.session.oauth;
  req.session.oauth = undefined;

  try {
    if (!p || !p.clientId) return fail("oauth_unavailable");

    const { code, state } = req.query;
    // state/PKCE 검증: 세션 보관값과 일치 + 동일 제공자 + 미만료
    if (
      !saved ||
      saved.provider !== name ||
      !code ||
      !state ||
      state !== saved.state
    ) {
      return fail("oauth_state_mismatch");
    }
    if (Date.now() > saved.expiresAt) {
      return fail("oauth_expired");
    }

    // 2) 인가코드 → 토큰(PKCE code_verifier 포함)
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: p.clientId,
      redirect_uri: redirectUri(name),
      code: String(code),
      code_verifier: saved.codeVerifier,
    });
    if (p.clientSecret) tokenBody.set("client_secret", p.clientSecret);

    const tokenRes = await fetch(p.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenBody.toString(),
    });
    if (!tokenRes.ok) return fail("oauth_token_failed");
    const token = await tokenRes.json();
    if (!token.access_token) return fail("oauth_token_failed");

    // 3) 액세스 토큰 → 프로필
    const userRes = await fetch(p.userInfoUrl, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!userRes.ok) return fail("oauth_profile_failed");
    const profile = p.parseProfile(await userRes.json());
    if (!profile.providerId) return fail("oauth_profile_failed");

    // 4) 소셜 계정 ↔ 로컬 회원 연결
    let user = await prisma.user.findFirst({
      where: { provider: name, providerId: profile.providerId },
    });
    if (!user) {
      const base = (profile.username || `${name}_${profile.providerId}`).trim();
      let username = base;
      let n = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${base}_${n++}`;
      }
      user = await prisma.user.create({
        data: {
          username,
          provider: name,
          providerId: profile.providerId,
          email: profile.email,
          passwordHash: null,
          active: true,
        },
      });
    }
    if (!user.active) return fail("suspended");

    await establishSession(req, {
      uid: user.id,
      role: "user",
      username: user.username,
    });
    res.redirect(`${CLIENT_ORIGIN}/`);
  } catch (e) {
    console.error("OAuth callback error:", e);
    fail("oauth_failed");
  }
});

export default router;
