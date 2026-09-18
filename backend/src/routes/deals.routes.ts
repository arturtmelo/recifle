import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { toPublicUserSummary } from "../lib/serializers";
import { notifyUser } from "../lib/notifications";
import { DEAL_STATUS } from "../lib/constants";

const router = Router();

function serializeDeal(d: any) {
  return {
    id: d.id,
    status: d.status,
    finalPricePerKg: d.finalPricePerKg,
    finalQuantityKg: d.finalQuantityKg,
    scheduledAt: d.scheduledAt,
    completedAt: d.completedAt,
    createdAt: d.createdAt,
    listing: d.listing
      ? {
          id: d.listing.id,
          title: d.listing.title,
          materialType: d.listing.materialType,
          photo: d.listing.photos?.[0]?.url ?? null,
        }
      : undefined,
    seller: d.seller ? toPublicUserSummary(d.seller) : undefined,
    buyer: d.buyer ? toPublicUserSummary(d.buyer) : undefined,
    reviews: d.reviews?.map((r: any) => ({
      id: r.id,
      fromUserId: r.fromUserId,
      toUserId: r.toUserId,
      rating: r.rating,
      comment: r.comment,
    })),
  };
}

router.get("/deals", requireAuth, async (req, res) => {
  const deals = await prisma.deal.findMany({
    where: { OR: [{ sellerId: req.userId }, { buyerId: req.userId }] },
    include: { listing: { include: { photos: true } }, seller: true, buyer: true, reviews: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ deals: deals.map(serializeDeal) });
});

router.get("/deals/:id", requireAuth, async (req, res) => {
  const deal = await prisma.deal.findUnique({
    where: { id: req.params.id },
    include: { listing: { include: { photos: true } }, seller: true, buyer: true, reviews: true },
  });
  if (!deal || (deal.sellerId !== req.userId && deal.buyerId !== req.userId)) {
    return res.status(404).json({ error: "Negócio não encontrado." });
  }
  res.json({ deal: serializeDeal(deal) });
});

const statusSchema = z.object({
  status: z.enum(DEAL_STATUS),
  scheduledAt: z.string().datetime().optional(),
});

const STATUS_FLOW: Record<string, string[]> = {
  CONFIRMADO: ["COLETA_AGENDADA", "CANCELADO"],
  COLETA_AGENDADA: ["COLETADO", "CANCELADO"],
  COLETADO: ["CONCLUIDO"],
  CONCLUIDO: [],
  CANCELADO: [],
};

router.patch("/deals/:id/status", requireAuth, async (req, res) => {
  const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!deal || (deal.sellerId !== req.userId && deal.buyerId !== req.userId)) {
    return res.status(404).json({ error: "Negócio não encontrado." });
  }

  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
  const { status, scheduledAt } = parsed.data;

  if (!STATUS_FLOW[deal.status]?.includes(status)) {
    return res.status(400).json({ error: `Não é possível mudar de ${deal.status} para ${status}.` });
  }

  const updated = await prisma.deal.update({
    where: { id: deal.id },
    data: {
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      completedAt: status === "CONCLUIDO" ? new Date() : undefined,
    },
  });

  if (status === "CONCLUIDO") {
    await prisma.user.update({
      where: { id: deal.sellerId },
      data: { totalKgRecycled: { increment: deal.finalQuantityKg }, dealsCompleted: { increment: 1 } },
    });
    await prisma.user.update({
      where: { id: deal.buyerId },
      data: { totalKgRecycled: { increment: deal.finalQuantityKg }, dealsCompleted: { increment: 1 } },
    });
  }

  const otherPartyId = deal.sellerId === req.userId ? deal.buyerId : deal.sellerId;
  await notifyUser(otherPartyId, "NEGOCIO_ATUALIZADO", "Status do negócio atualizado", `O negócio agora está: ${status}.`, {
    dealId: deal.id,
  });

  res.json({ deal: serializeDeal(updated) });
});

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});

router.post("/deals/:id/reviews", requireAuth, async (req, res) => {
  const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!deal || (deal.sellerId !== req.userId && deal.buyerId !== req.userId)) {
    return res.status(404).json({ error: "Negócio não encontrado." });
  }
  if (deal.status !== "CONCLUIDO") {
    return res.status(400).json({ error: "Só é possível avaliar negócios concluídos." });
  }

  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });

  const toUserId = deal.sellerId === req.userId ? deal.buyerId : deal.sellerId;
  const existing = await prisma.review.findUnique({
    where: { dealId_fromUserId: { dealId: deal.id, fromUserId: req.userId! } },
  });
  if (existing) return res.status(409).json({ error: "Você já avaliou este negócio." });

  const review = await prisma.review.create({
    data: { dealId: deal.id, fromUserId: req.userId!, toUserId, rating: parsed.data.rating, comment: parsed.data.comment },
  });

  await notifyUser(toUserId, "NOVA_AVALIACAO", "Você recebeu uma avaliação", `Nota: ${parsed.data.rating}/5.`, {
    dealId: deal.id,
  });

  res.status(201).json({ review });
});

router.get("/users/:id/reviews", async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { toUserId: req.params.id },
    include: { fromUser: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      from: toPublicUserSummary(r.fromUser),
    })),
  });
});

export default router;
