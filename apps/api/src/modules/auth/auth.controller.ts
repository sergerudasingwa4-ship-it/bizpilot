// apps/api/src/modules/auth/auth.controller.ts
import { Response } from "express";
import { loginUser } from "./auth.service";
import { AuthRequest } from "./auth.middleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Contrôleur de login
export const loginController = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const result = await loginUser(email, password);

    res.status(200).json({
      message: "Connexion réussie",
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

// Contrôleur pour récupérer l'utilisateur connecté
export const getMeController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Utilisateur connecté",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};