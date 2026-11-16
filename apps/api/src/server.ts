// apps/api/src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes"; // <-- NOUVEAU

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json()); // Pour lire le JSON envoyé par le client

// Route de test
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "BizPilot API is running" });
});

// Enregistrer les routes d'auth
// Toutes les routes dans authRoutes commenceront par /auth
app.use("/auth", authRoutes); // <-- NOUVEAU

app.listen(PORT, () => {
  console.log(`🚀 BizPilot API running on http://localhost:${PORT}`);
});