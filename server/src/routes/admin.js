import { Router } from "express";
import { prisma } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// 이 라우터의 모든 엔드포인트는 관리자 전용
router.use(requireAdmin);

// GET /api/admin/users — 회원 목록 + 작성 글 수
router.get("/users", async (_req, res) => {
  const [users, posts] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.post.findMany(),
  ]);
  const countByUser = new Map();
  for (const p of posts) {
    if (p.userId != null) {
      countByUser.set(p.userId, (countByUser.get(p.userId) || 0) + 1);
    }
  }
  res.json(
    users.map((u) => ({
      id: u.id,
      username: u.username,
      active: u.active,
      createdAt: u.createdAt,
      postCount: countByUser.get(u.id) || 0,
    }))
  );
});

// PATCH /api/admin/users/:id — 회원 정지/해제 ({ active: boolean })
router.patch("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 회원 ID입니다." });
  }
  if (typeof req.body.active !== "boolean") {
    return res.status(400).json({ error: "active(boolean) 값이 필요합니다." });
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { active: req.body.active },
    });
    res.json({ id: user.id, username: user.username, active: user.active });
  } catch {
    res.status(404).json({ error: "회원을 찾을 수 없습니다." });
  }
});

// DELETE /api/admin/users/:id — 회원 삭제(작성 글은 작성자 정보가 비워짐)
router.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 회원 ID입니다." });
  }
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "회원을 찾을 수 없습니다." });
  }
});

export default router;
