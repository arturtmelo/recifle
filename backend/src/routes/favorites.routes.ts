import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { toPublicUser } from "../lib/serializers";

const router = Router();

const targetSchema = z.object({
  targetType: z.enum(["LISTING", "CENTRO"]),
  targetId: z.string(),
});

router.post("/toggle", requireAuth, async (req, res) => {
  const parsed = targetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
  const { targetType, targetId } = parsed.data;

  const existing = await prisma.favorite.findUnique({
    where: { userId_targetType_targetId: { userId: req.userId!, targetType, targetId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return res.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId: req.userId!, targetType, targetId } });
  res.json({ favorited: true });
});

router.get("/ids", requireAuth, async (req, res) => {
  const favorites = await prisma.favorite.findMany({ where: { userId: req.userId } });
  res.json({
    listingIds: favorites.filter((f) => f.targetType === "LISTING").map((f) => f.targetId),
    centerIds: favorites.filter((f) => f.targetType === "CENTRO").map((f) => f.targetId),
  });
});

router.get("/listings", requireAuth, async (req, res) => {
  const favorites = await prisma.favorite.findMany({ where: { userId: req.userId, targetType: "LISTING" } });
  const listings = await prisma.listing.findMany({
    where: { id: { in: favorites.map((f) => f.targetId) } },
    include: { photos: true, owner: true },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    listings: listings.map((listing) => ({
      id: listing.id,
      materialType: listing.materialType,
      title: listing.title,
      description: listing.description,
      quantityKg: listing.quantityKg,
      status: listing.status,
      priceType: listing.priceType,
      pricePerKg: listing.pricePerKg,
      addressText: listing.addressText,
      lat: listing.lat,
      lng: listing.lng,
      createdAt: listing.createdAt,
      photos: listing.photos.map((p) => p.url),
      owner: listing.owner
        ? {
            id: listing.owner.id,
            name: listing.owner.name,
            avatarUrl: listing.owner.avatarUrl,
          }
        : undefined,
    })),
  });
});

router.get("/centers", requireAuth, async (req, res) => {
  const favorites = await prisma.favorite.findMany({ where: { userId: req.userId, targetType: "CENTRO" } });
  const centers = await prisma.user.findMany({
    where: { id: { in: favorites.map((f) => f.targetId) }, role: "CENTRO" },
    include: { centerProfile: { include: { materials: true } } },
  });

  res.json({ centers: centers.map((c) => toPublicUser(c)) });
});

export default router;
