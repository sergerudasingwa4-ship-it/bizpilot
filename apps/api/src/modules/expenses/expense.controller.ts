import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../auth/auth.middleware";
import { createExpense, getCompanyExpenses, getExpensesByCategory } from "./expense.service";

const prisma = new PrismaClient();

export const createExpenseController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const { companyId, category, amount, description, occurredAt } = req.body;
    if (!companyId || !category || !amount) {
      return res.status(400).json({ error: "companyId, category et amount sont requis" });
    }

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const expense = await createExpense(companyId, {
      category,
      amount: parseFloat(amount),
      description,
      occurredAt: occurredAt ? new Date(occurredAt) : undefined,
    });

    res.status(201).json({ message: "Dépense enregistrée avec succès", data: expense });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanyExpensesController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const expenses = await getCompanyExpenses(companyId);
    res.status(200).json({ message: "Dépenses récupérées", data: expenses });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getExpensesByCategoryController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const membership = await prisma.companyMember.findFirst({ where: { userId, companyId } });
    if (!membership) return res.status(403).json({ error: "Accès refusé à cette entreprise" });

    const stats = await getExpensesByCategory(companyId);
    res.status(200).json({ message: "Statistiques par catégorie", data: stats });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};