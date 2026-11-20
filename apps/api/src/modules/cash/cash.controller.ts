import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../auth/auth.middleware";
import { getCashMovements, getCashBalance } from "./cash.service";

const prisma = new PrismaClient();

export const getCashMovementsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const movements = await getCashMovements(companyId);
    res.status(200).json({ message: "Mouvements de caisse récupérés", data: movements });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getCashBalanceController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const balance = await getCashBalance(companyId);
    res.status(200).json({ message: "Solde de caisse", data: balance });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};