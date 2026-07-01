import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validatePost } from "../validators.js";

const router = Router();

// 본인 글이거나 관리자면 true
function canModify(auth, post) {
  if (!auth) return false;
  if (auth.role === "admin") return true;
  return post.userId != null && post.userId === auth.uid;
}

// GET /api/posts — 목록(공개 읽기, 댓글 수 포함)
router.get("/", async (_req, res) => {
  const [posts, comments] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.comment.findMany(),
  ]);
  const counts = new Map();
  for (const c of comments) {
    counts.set(c.postId, (counts.get(c.postId) || 0) + 1);
  }
  res.json(posts.map((p) => ({ ...p, commentCount: counts.get(p.id) || 0 })));
});

// GET /api/posts/:id — 단일(공개 읽기)
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 글 ID입니다." });
  }
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: "글을 찾을 수 없습니다." });
  res.json(post);
});

// POST /api/posts — 생성(로그인 필요, 작성자는 세션에서 자동 설정)
router.post("/", requireAuth, async (req, res) => {
  const result = validatePost(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const { uid, role, username } = req.session.auth;
  const post = await prisma.post.create({
    data: {
      ...result.value,
      author: username,
      userId: role === "user" ? uid : null, // 관리자 글은 소유자 없음
    },
  });
  res.status(201).json(post);
});

// PUT /api/posts/:id — 수정(본인 또는 관리자)
router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 글 ID입니다." });
  }
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: "글을 찾을 수 없습니다." });
  if (!canModify(req.session.auth, post)) {
    return res.status(403).json({ error: "본인 글만 수정할 수 있습니다." });
  }
  const result = validatePost(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const updated = await prisma.post.update({
    where: { id },
    data: result.value, // title/content만 수정, 작성자·소유자는 유지
  });
  res.json(updated);
});

// DELETE /api/posts/:id — 삭제(본인 또는 관리자)
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 글 ID입니다." });
  }
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: "글을 찾을 수 없습니다." });
  if (!canModify(req.session.auth, post)) {
    return res.status(403).json({ error: "본인 글만 삭제할 수 있습니다." });
  }
  await prisma.post.delete({ where: { id } });
  res.status(204).end();
});

export default router;
