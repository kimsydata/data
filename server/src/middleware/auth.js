import { prisma } from "../db.js";

// 세션에는 { uid, role: "user" | "admin", username } 형태로 저장된다.

// 로그인(회원 또는 관리자) 필요 — 미인증 401
// 일반 회원은 매 요청 시 계정 존재·활성 상태를 확인(정지 즉시 차단)
export async function requireAuth(req, res, next) {
  try {
    if (!req.session || !req.session.auth) {
      return res.status(401).json({ error: "로그인이 필요합니다." });
    }
    if (req.session.auth.role === "user") {
      const user = await prisma.user.findUnique({
        where: { id: req.session.auth.uid },
      });
      if (!user) {
        return req.session.destroy(() =>
          res.status(401).json({ error: "로그인이 필요합니다." })
        );
      }
      if (!user.active) {
        return res
          .status(403)
          .json({ error: "정지된 계정입니다. 관리자에게 문의하세요." });
      }
    }
    next();
  } catch (e) {
    next(e);
  }
}

// 관리자 전용 — 미인증 401 / 권한부족 403
export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.auth) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }
  if (req.session.auth.role !== "admin") {
    return res.status(403).json({ error: "관리자 권한이 필요합니다." });
  }
  next();
}
