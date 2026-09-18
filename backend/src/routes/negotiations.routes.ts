import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { toPublicUserSummary } from "../lib/serializers";
import { notifyUser } from "../lib/notifications";
import { getIO } from "../lib/io";

const router = Router();

function serializeNegotiation(n: any) {
  return {
    id: n.id,
    status: n.status,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    listing: n.listing
      ? {
          id: n.listing.id,
          title: n.listing.title,
          materialType: n.listing.materialType,
          quantityKg: n.listing.quantityKg,
          priceType: n.listing.priceType,
          pricePerKg: n.listing.pricePerKg,
          status: n.listing.status,
          photo: n.listing.photos?.[0]?.url ?? null,
        }
      : undefined,
    seller: n.seller ? toPublicUserSummary(n.seller) : undefined,
    buyer: n.buyer ? toPublicUserSummary(n.buyer) : undefined,
    offers: n.offers?.map((o: any) => ({
      id: o.id,
      authorId: o.authorId,
      type: o.type,
      pricePerKg: o.pricePerKg,
      quantityKg: o.quantityKg,
      message: o.message,
      createdAt: o.createdAt,
    })),
    messages: n.messages?.map((m: any) => ({
      id: m.id,
      senderId: m.senderId,
      text: m.text,
      createdAt: m.createdAt,
      readAt: m.readAt,
    })),
    deal: n.deal ? { id: n.deal.id, status: n.deal.status } : null,
  };
}

async function assertParticipant(negotiationId: string, userId: string) {
  const negotiation = await prisma.negotiation.findUnique({ where: { id: negotiationId } });
  if (!negotiation) return { negotiation: null, allowed: false };
  const allowed = negotiation.sellerId === userId || negotiation.buyerId === userId;
  return { negotiation, allowed };
}

// Inicia uma negociação para um anúncio, com a primeira proposta.
const startSchema = z.object({
  pricePerKg: z.coerce.number().nonnegative().optional(),
  quantityKg: z.coerce.number().positive(),
  message: z.string().optional(),
});

router.post("/listings/:listingId/negotiations", requireAuth, async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.listingId } });
  if (!listing) return res.status(404).json({ error: "Anúncio não encontrado." });
  if (listing.ownerId === req.userId) {
    return res.status(400).json({ error: "Você não pode negociar com o próprio anúncio." });
  }
  if (listing.status !== "DISPONIVEL") {
    return res.status(400).json({ error: "Este anúncio não está mais disponível." });
  }

  const parsed = startSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
  const { pricePerKg, quantityKg, message } = parsed.data;

  const existing = await prisma.negotiation.findUnique({
    where: { listingId_buyerId: { listingId: listing.id, buyerId: req.userId! } },
  });
  if (existing) {
    return res.status(409).json({ error: "Você já iniciou uma negociação para este anúncio.", negotiationId: existing.id });
  }

  const negotiation = await prisma.negotiation.create({
    data: {
      listingId: listing.id,
      sellerId: listing.ownerId,
      buyerId: req.userId!,
      offers: {
        create: { authorId: req.userId!, type: "PROPOSTA", pricePerKg, quantityKg, message },
      },
    },
    include: {
      listing: { include: { photos: true } },
      seller: true,
      buyer: true,
      offers: true,
      messages: true,
      deal: true,
    },
  });

  await notifyUser(
    listing.ownerId,
    "NOVA_PROPOSTA",
    "Nova proposta recebida",
    `Você recebeu uma proposta para "${listing.title}".`,
    { negotiationId: negotiation.id }
  );

  res.status(201).json({ negotiation: serializeNegotiation(negotiation) });
});

router.get("/negotiations", requireAuth, async (req, res) => {
  const negotiations = await prisma.negotiation.findMany({
    where: { OR: [{ sellerId: req.userId }, { buyerId: req.userId }] },
    include: {
      listing: { include: { photos: true } },
      seller: true,
      buyer: true,
      offers: { orderBy: { createdAt: "desc" }, take: 1 },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      deal: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ negotiations: negotiations.map(serializeNegotiation) });
});

router.get("/negotiations/:id", requireAuth, async (req, res) => {
  const { allowed } = await assertParticipant(req.params.id, req.userId!);
  if (!allowed) return res.status(404).json({ error: "Negociação não encontrada." });

  const negotiation = await prisma.negotiation.findUnique({
    where: { id: req.params.id },
    include: {
      listing: { include: { photos: true } },
      seller: true,
      buyer: true,
      offers: { orderBy: { createdAt: "asc" } },
      messages: { orderBy: { createdAt: "asc" } },
      deal: true,
    },
  });
  res.json({ negotiation: serializeNegotiation(negotiation) });
});

const offerSchema = z.object({
  type: z.enum(["CONTRA", "ACEITE", "RECUSA"]),
  pricePerKg: z.coerce.number().nonnegative().optional(),
  quantityKg: z.coerce.number().positive().optional(),
  message: z.string().optional(),
});

router.post("/negotiations/:id/offers", requireAuth, async (req, res) => {
  const { negotiation, allowed } = await assertParticipant(req.params.id, req.userId!);
  if (!negotiation || !allowed) return res.status(404).json({ error: "Negociação não encontrada." });
  if (negotiation.status !== "ABERTA") {
    return res.status(400).json({ error: "Esta negociação já foi encerrada." });
  }

  const parsed = offerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
  const { type, message } = parsed.data;

  const lastOffer = await prisma.offer.findFirst({
    where: { negotiationId: negotiation.id },
    orderBy: { createdAt: "desc" },
  });
  const pricePerKg = parsed.data.pricePerKg ?? lastOffer?.pricePerKg ?? undefined;
  const quantityKg = parsed.data.quantityKg ?? lastOffer?.quantityKg ?? 0;

  const otherPartyId = negotiation.sellerId === req.userId ? negotiation.buyerId : negotiation.sellerId;

  const offer = await prisma.offer.create({
    data: { negotiationId: negotiation.id, authorId: req.userId!, type, pricePerKg, quantityKg, message },
  });

  if (type === "RECUSA") {
    await prisma.negotiation.update({ where: { id: negotiation.id }, data: { status: "RECUSADA" } });
    await notifyUser(otherPartyId, "PROPOSTA_RECUSADA", "Proposta recusada", "Uma proposta foi recusada.", {
      negotiationId: negotiation.id,
    });
  } else if (type === "CONTRA") {
    await prisma.negotiation.update({ where: { id: negotiation.id }, data: { updatedAt: new Date() } });
    await notifyUser(otherPartyId, "CONTRA_PROPOSTA", "Contraproposta recebida", "Você recebeu uma contraproposta.", {
      negotiationId: negotiation.id,
    });
  } else if (type === "ACEITE") {
    await prisma.negotiation.update({ where: { id: negotiation.id }, data: { status: "ACEITA" } });
    await prisma.listing.update({ where: { id: negotiation.listingId }, data: { status: "FECHADO" } });
    const deal = await prisma.deal.create({
      data: {
        negotiationId: negotiation.id,
        listingId: negotiation.listingId,
        sellerId: negotiation.sellerId,
        buyerId: negotiation.buyerId,
        finalPricePerKg: pricePerKg,
        finalQuantityKg: quantityKg,
        status: "CONFIRMADO",
      },
    });
    await notifyUser(otherPartyId, "PROPOSTA_ACEITA", "Negócio fechado!", "Sua proposta foi aceita. Combine a coleta.", {
      negotiationId: negotiation.id,
      dealId: deal.id,
    });
  }

  getIO()?.to(`negotiation:${negotiation.id}`).emit("negotiation:update", { negotiationId: negotiation.id });

  res.status(201).json({ offer });
});

const messageSchema = z.object({ text: z.string().min(1) });

router.post("/negotiations/:id/messages", requireAuth, async (req, res) => {
  const { negotiation, allowed } = await assertParticipant(req.params.id, req.userId!);
  if (!negotiation || !allowed) return res.status(404).json({ error: "Negociação não encontrada." });

  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Mensagem inválida." });

  const otherPartyId = negotiation.sellerId === req.userId ? negotiation.buyerId : negotiation.sellerId;

  const msg = await prisma.message.create({
    data: { negotiationId: negotiation.id, senderId: req.userId!, text: parsed.data.text },
  });

  getIO()?.to(`negotiation:${negotiation.id}`).emit("message:new", msg);
  await notifyUser(otherPartyId, "NOVA_MENSAGEM", "Nova mensagem", parsed.data.text.slice(0, 80), {
    negotiationId: negotiation.id,
  });

  res.status(201).json({ message: msg });
});

export default router;
