import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ notifications });
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification || notification.userId !== req.userId) {
    return res.status(404).json({ error: "Notificação não encontrada." });
  }
  const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
  res.json({ notification: updated });
});

router.post("/read-all", requireAuth, async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.userId, read: false }, data: { read: true } });
  res.status(204).send();
});

export default router;
