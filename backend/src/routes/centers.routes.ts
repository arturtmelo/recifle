import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { MATERIAL_TYPES } from "../lib/constants";
import { distanceKm } from "../lib/geo";
import { toPublicUser } from "../lib/serializers";

const router = Router();

const listQuerySchema = z.object({
  materialType: z.enum(MATERIAL_TYPES).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
});

router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Filtros inválidos." });
  const { materialType, lat, lng, radiusKm } = parsed.data;

  const users = await prisma.user.findMany({
    where: {
      role: "CENTRO",
      ...(materialType
        ? { centerProfile: { materials: { some: { materialType } } } }
        : {}),
    },
    include: { centerProfile: { include: { materials: true } } },
  });

  let centers = users.map((u) => {
    const distance =
      lat !== undefined && lng !== undefined && u.lat !== null && u.lng !== null
        ? distanceKm(lat, lng, u.lat, u.lng)
        : undefined;
    return { ...toPublicUser(u), distanceKm: distance !== undefined ? Math.round(distance * 10) / 10 : undefined };
  });

  if (lat !== undefined && lng !== undefined) {
    if (radiusKm !== undefined) {
      centers = centers.filter((c) => c.distanceKm === undefined || c.distanceKm <= radiusKm);
    }
    centers.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  res.json({ centers });
});

router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { centerProfile: { include: { materials: true } } },
  });
  if (!user || user.role !== "CENTRO") return res.status(404).json({ error: "Centro não encontrado." });
  res.json({ center: toPublicUser(user) });
});

const updateSchema = z.object({
  description: z.string().optional(),
  openingHours: z.string().optional(),
  materials: z.array(z.enum(MATERIAL_TYPES)).optional(),
  addressText: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

router.patch("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { centerProfile: true },
  });
  if (!user || user.role !== "CENTRO" || !user.centerProfile) {
    return res.status(403).json({ error: "Apenas centros de reciclagem podem editar este perfil." });
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
  const { description, openingHours, materials, addressText, lat, lng } = parsed.data;

  await prisma.user.update({
    where: { id: req.userId },
    data: { addressText, lat, lng },
  });

  await prisma.centerProfile.update({
    where: { id: user.centerProfile.id },
    data: {
      description,
      openingHours,
      ...(materials
        ? {
            materials: {
              deleteMany: {},
              create: materials.map((materialType) => ({ materialType })),
            },
          }
        : {}),
    },
  });

  const updated = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { centerProfile: { include: { materials: true } } },
  });
  res.json({ user: toPublicUser(updated!) });
});

export default router;
