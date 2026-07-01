import { Router } from "express";
import { prisma } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateProduct } from "../validators.js";

const router = Router();

// GET /api/products — 전체 목록(공개)
router.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

// GET /api/products/:id — 단일 조회(공개)
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 제품 ID입니다." });
  }
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return res.status(404).json({ error: "제품을 찾을 수 없습니다." });
  }
  res.json(product);
});

// POST /api/products — 생성(관리자)
router.post("/", requireAdmin, async (req, res) => {
  const result = validateProduct(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });
  const product = await prisma.product.create({ data: result.value });
  res.status(201).json(product);
});

// PUT /api/products/:id — 수정(관리자)
router.put("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 제품 ID입니다." });
  }
  const result = validateProduct(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });
  try {
    const product = await prisma.product.update({
      where: { id },
      data: result.value,
    });
    res.json(product);
  } catch {
    res.status(404).json({ error: "제품을 찾을 수 없습니다." });
  }
});

// DELETE /api/products/:id — 삭제(관리자)
router.delete("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "잘못된 제품 ID입니다." });
  }
  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "제품을 찾을 수 없습니다." });
  }
});

export default router;
