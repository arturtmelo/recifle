import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword, signToken } from "../lib/auth";
import { requireAuth } from "../middleware/auth";
import { ROLES } from "../lib/constants";
import { toPublicUser } from "../lib/serializers";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(ROLES),
  phone: z.string().optional(),
  addressText: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados inválidos.", details: parsed.error.flatten() });
  }
  const { name, email, password, role, phone, addressText, lat, lng } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Este e-mail já está cadastrado." });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      phone,
      addressText,
      lat,
      lng,
      ...(role === "CENTRO" ? { centerProfile: { create: {} } } : {}),
    },
    include: { centerProfile: { include: { materials: true } } },
  });

  const token = signToken(user.id);
  res.status(201).json({ token, user: toPublicUser(user) });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados inválidos." });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { centerProfile: { include: { materials: true } } },
  });
  if (!user) {
    return res.status(401).json({ error: "E-mail ou senha incorretos." });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "E-mail ou senha incorretos." });
  }

  const token = signToken(user.id);
  res.json({ token, user: toPublicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { centerProfile: { include: { materials: true } } },
  });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
  res.json({ user: toPublicUser(user) });
});

export default router;
