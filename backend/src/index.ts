import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { initSockets } from "./sockets";

import authRoutes from "./routes/auth.routes";
import listingsRoutes from "./routes/listings.routes";
import centersRoutes from "./routes/centers.routes";
import negotiationsRoutes from "./routes/negotiations.routes";
import dealsRoutes from "./routes/deals.routes";
import notificationsRoutes from "./routes/notifications.routes";
import favoritesRoutes from "./routes/favorites.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/listings", listingsRoutes);
app.use("/centers", centersRoutes);
app.use("/", negotiationsRoutes); // expõe /listings/:id/negotiations e /negotiations*
app.use("/", dealsRoutes); // expõe /deals* e /users/:id/reviews
app.use("/notifications", notificationsRoutes);
app.use("/favorites", favoritesRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const httpServer = createServer(app);
initSockets(httpServer);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
httpServer.listen(PORT, () => {
  console.log(`ReciCla API rodando em http://localhost:${PORT}`);
});
