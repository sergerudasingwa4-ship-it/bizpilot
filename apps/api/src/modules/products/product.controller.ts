import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../auth/auth.middleware";
import { createProduct, getProductsByCompany } from "./product.service";

const prisma = new PrismaClient();

export const createProductController = async (req: AuthRequest, res: Response) => {
  try {
    const { companyId, name, unitPrice, sku, costPrice, currentStock, lowStockThreshold } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });
    if (!companyId || !name || !unitPrice)
      return res.status(400).json({ error: "companyId, name et unitPrice sont requis" });

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const product = await createProduct(companyId, {
      name,
      unitPrice: parseFloat(unitPrice),
      sku,
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      currentStock: currentStock ? parseInt(currentStock) : 0,
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 5,
    });
    res.status(201).json({ message: "Produit créé avec succès", data: product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id: companyId } = req.params;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const products = await getProductsByCompany(companyId);
    res.status(200).json({ message: "Produits récupérés", data: products });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};