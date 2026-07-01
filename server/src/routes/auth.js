import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prisma } from "../db.js";
import { establishSession } from "../session.js";

const router = Router();

// 인증 엔드포인트 무차별 대입(brute-force) 방지 — IP당 15분에 20회
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요." },
});

const MAX_PW = 200; // 과도한 입력으로 인한 자원 소모 방지

function readCredentials(body) {
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  return { username, password };
}

// POST /api/auth/register — 일반 회원가입 후 자동 로그인
router.post("/register", authLimiter, async (req, res) => {
  const { username, password } = readCredentials(req.body);

  if (!username || !password) {
    return res.status(400).json({ error: "아이디와 비밀번호를 입력하세요." });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: "아이디는 3~20자여야 합니다." });
  }
  if (password.length < 4 || password.length > MAX_PW) {
    return res.status(400).json({ error: "비밀번호는 4자 이상이어야 합니다." });
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
  }
  const reserved = await prisma.admin.findUnique({ where: { username } });
  if (reserved) {
    return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { username, passwordHash } });
  await establishSession(req, {
    uid: user.id,
    role: "user",
    username: user.username,
  });
  res.status(201).json({ role: "user", username: user.username });
});

// POST /api/auth/login — 로그인(회원 + 관리자 통합)
router.post("/login", authLimiter, async (req, res) => {
  const { username, password } = readCredentials(req.body);

  if (!username || !password || password.length > MAX_PW) {
    return res.status(400).json({ error: "아이디와 비밀번호를 입력하세요." });
  }

  // 1) 관리자 계정 우선 확인(메인 로그인 폼에서도 관리자 로그인 허용)
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (
    admin &&
    admin.passwordHash &&
    (await bcrypt.compare(password, admin.passwordHash))
  ) {
    await establishSession(req, {
      uid: admin.id,
      role: "admin",
      username: admin.username,
    });
    return res.json({ role: "admin", username: admin.username });
  }

  // 2) 일반 회원 확인
  const user = await prisma.user.findUnique({ where: { username } });
  // 아이디 존재 여부/소셜 전용 계정 여부와 무관하게 동일한 응답(사용자 열거 방지)
  if (
    !user ||
    !user.passwordHash ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    return res
      .status(401)
      .json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }
  if (!user.active) {
    return res
      .status(403)
      .json({ error: "정지된 계정입니다. 관리자에게 문의하세요." });
  }
  await establishSession(req, {
    uid: user.id,
    role: "user",
    username: user.username,
  });
  res.json({ role: "user", username: user.username });
});

// POST /api/auth/admin/login — 관리자 로그인
router.post("/admin/login", authLimiter, async (req, res) => {
  const { username, password } = readCredentials(req.body);

  if (!username || !password || password.length > MAX_PW) {
    return res.status(400).json({ error: "아이디와 비밀번호를 입력하세요." });
  }
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res
      .status(401)
      .json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }
  await establishSession(req, {
    uid: admin.id,
    role: "admin",
    username: admin.username,
  });
  res.json({ role: "admin", username: admin.username });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

// GET /api/auth/me — 현재 로그인 상태
router.get("/me", (req, res) => {
  if (req.session && req.session.auth) {
    const { uid, role, username } = req.session.auth;
    return res.json({ authenticated: true, uid, role, username });
  }
  res.json({ authenticated: false });
});

export default router;
