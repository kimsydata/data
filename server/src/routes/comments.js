import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validateComment } from "../validators.js";

const router = Router();

function canModify(auth, comment) {
  if (!auth) return false;
  if (auth.role === "admin") return true;
  return comment.userId != null && comment.userId === auth.uid;
}

// GET /api/posts/:postId/comments — 댓글 목록(공개 읽기)
router.get("/posts/:postId/comments", async (req, res) => {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId)) {
    return res.status(400).json({ error: "잘못된 글 ID입니다." });
  }
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
  });
  res.json(comments);
});

// POST /api/posts/:postId/comments — 댓글 작성(로그인 필요)
router.post("/posts/:postId/comments", requireAuth, async (req, res) => {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId)) {
    return res.status(400).json({ error: "잘못된 글 ID입니다." });
  }
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ error: "글을 찾을 수 없습니다." });

  const result = validateComment(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const { uid, role, username } = req.session.auth;
  const comment = await prisma.comment.create({
    data: {
      content: result.value.content,
      author: username,
      postId,
      userId: role === "user" ? uid : null,
    },
  });
  res.status(201).json(comment);
});

// PUT /api/comments/:id — 댓글 수정(작성자 본인 또는 관리자)
router.put("/comments/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 댓글 ID입니다." });
  }
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
  if (!canModify(req.session.auth, comment)) {
    return res.status(403).json({ error: "본인 댓글만 수정할 수 있습니다." });
  }
  const result = validateComment(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const updated = await prisma.comment.update({
    where: { id },
    data: { content: result.value.content },
  });
  res.json(updated);
});

// DELETE /api/comments/:id — 댓글 삭제(작성자 본인 또는 관리자)
router.delete("/comments/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 댓글 ID입니다." });
  }
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
  if (!canModify(req.session.auth, comment)) {
    return res.status(403).json({ error: "본인 댓글만 삭제할 수 있습니다." });
  }
  await prisma.comment.delete({ where: { id } });
  res.status(204).end();
});

export default router;
