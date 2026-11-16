// apps/api/src/modules/auth/auth.service.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Fonction pour se connecter
export const loginUser = async (email: string, password: string) => {
  // 1. Chercher l'utilisateur par email
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  // 2. Vérifier le mot de passe (comparer le texte clair avec le hash)
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Mot de passe incorrect");
  }

  // 3. Générer le JWT (le "bracelet")
  const token = jwt.sign(
    { userId: user.id, email: user.email }, // Données dans le token
    process.env.JWT_SECRET || "default_secret", // Clé secrète
    { expiresIn: "7d" } // Valide pour 7 jours
  );

  return {
    user: { id: user.id, email: user.email, fullName: user.fullName },
    token,
  };
};