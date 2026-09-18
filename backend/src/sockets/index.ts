import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { setIO } from "../lib/io";

export function initSockets(httpServer: HttpServer) {
  const io = new Server(httpServer, { cors: { origin: "*" } });
  setIO(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Token não fornecido."));
    try {
      const payload = verifyToken(token);
      (socket.data as { userId: string }).userId = payload.sub;
      next();
    } catch {
      next(new Error("Token inválido."));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket.data as { userId: string }).userId;
    socket.join(`user:${userId}`);

    socket.on("negotiation:join", async (negotiationId: string) => {
      const negotiation = await prisma.negotiation.findUnique({ where: { id: negotiationId } });
      if (negotiation && (negotiation.sellerId === userId || negotiation.buyerId === userId)) {
        socket.join(`negotiation:${negotiationId}`);
      }
    });

    socket.on("negotiation:leave", (negotiationId: string) => {
      socket.leave(`negotiation:${negotiationId}`);
    });
  });

  return io;
}
