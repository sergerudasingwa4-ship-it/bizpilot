import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../auth/auth.middleware";
import { getDashboard } from "./dashboard.service";

const prisma = new PrismaClient();

export const getDashboardController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const dashboard = await getDashboard(companyId);
    res.status(200).json({ message: "Dashboard récupéré", data: dashboard });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};