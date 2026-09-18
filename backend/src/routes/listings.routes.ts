import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { LISTING_STATUS, MATERIAL_TYPES, PRICE_TYPES } from "../lib/constants";
import { distanceKm } from "../lib/geo";
import { toPublicUserSummary } from "../lib/serializers";

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

function serializeListing(listing: any, distance?: number) {
  return {
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
    photos: listing.photos?.map((p: any) => p.url) ?? [],
    owner: listing.owner ? toPublicUserSummary(listing.owner) : undefined,
    distanceKm: distance !== undefined ? Math.round(distance * 10) / 10 : undefined,
  };
}

const listQuerySchema = z.object({
  materialType: z.enum(MATERIAL_TYPES).optional(),
  status: z.enum(LISTING_STATUS).optional(),
  ownerId: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
});

router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Filtros inválidos." });
  const { materialType, status, ownerId, lat, lng, radiusKm, maxPrice, search } = parsed.data;

  const listings = await prisma.listing.findMany({
    where: {
      ...(materialType ? { materialType } : {}),
      ...(status ? { status } : { status: { not: "CANCELADO" } }),
      ...(ownerId ? { ownerId } : {}),
      ...(maxPrice !== undefined ? { pricePerKg: { lte: maxPrice } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    include: { photos: true, owner: true },
    orderBy: { createdAt: "desc" },
  });

  let result = listings.map((listing) => {
    const distance =
      lat !== undefined && lng !== undefined && listing.lat !== null && listing.lng !== null
        ? distanceKm(lat, lng, listing.lat, listing.lng)
        : undefined;
    return serializeListing(listing, distance);
  });

  if (lat !== undefined && lng !== undefined) {
    if (radiusKm !== undefined) {
      result = result.filter((l) => l.distanceKm === undefined || l.distanceKm <= radiusKm);
    }
    result.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  res.json({ listings: result });
});

router.get("/:id", async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: { photos: true, owner: true },
  });
  if (!listing) return res.status(404).json({ error: "Anúncio não encontrado." });
  res.json({ listing: serializeListing(listing) });
});

const createSchema = z.object({
  materialType: z.enum(MATERIAL_TYPES),
  title: z.string().min(3),
  description: z.string().optional(),
  quantityKg: z.coerce.number().positive(),
  priceType: z.enum(PRICE_TYPES),
  pricePerKg: z.coerce.number().nonnegative().optional(),
  addressText: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

router.post("/", requireAuth, upload.array("photos", 6), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados inválidos.", details: parsed.error.flatten() });
  }
  const data = parsed.data;
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  const listing = await prisma.listing.create({
    data: {
      ownerId: req.userId!,
      materialType: data.materialType,
      title: data.title,
      description: data.description,
      quantityKg: data.quantityKg,
      priceType: data.priceType,
      pricePerKg: data.priceType === "VENDA" ? data.pricePerKg : null,
      addressText: data.addressText,
      lat: data.lat,
      lng: data.lng,
      photos: {
        create: files.map((f) => ({ url: `/uploads/${f.filename}` })),
      },
    },
    include: { photos: true, owner: true },
  });

  res.status(201).json({ listing: serializeListing(listing) });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: "Anúncio não encontrado." });
  if (listing.ownerId !== req.userId) return res.status(403).json({ error: "Sem permissão." });

  const patchSchema = createSchema.partial().extend({
    status: z.enum(LISTING_STATUS).optional(),
  });
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });

  const updated = await prisma.listing.update({
    where: { id: req.params.id },
    data: parsed.data,
    include: { photos: true, owner: true },
  });
  res.json({ listing: serializeListing(updated) });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: "Anúncio não encontrado." });
  if (listing.ownerId !== req.userId) return res.status(403).json({ error: "Sem permissão." });

  await prisma.listing.update({ where: { id: req.params.id }, data: { status: "CANCELADO" } });
  res.status(204).send();
});

export default router;
