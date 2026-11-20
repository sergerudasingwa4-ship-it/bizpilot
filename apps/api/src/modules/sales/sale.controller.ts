import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../auth/auth.middleware";
import { createSale, getCompanySales } from "./sale.service";

const prisma = new PrismaClient();

export const createSaleController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const { companyId, items, paymentMethod, notes } = req.body;
    if (!companyId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "companyId et items (tableau) sont requis" });
    }

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const sale = await createSale(companyId, userId, items, paymentMethod || "cash", notes);
    res.status(201).json({ message: "Vente enregistrée avec succès", data: sale });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCompanySalesController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const sales = await getCompanySales(companyId);
    res.status(200).json({ message: "Ventes récupérées", data: sales });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};