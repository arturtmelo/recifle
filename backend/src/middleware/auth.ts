import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/auth";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }
    req.userId = user.id;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}
