// apps/api/src/modules/auth/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Étendre l'interface Request pour ajouter user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Middleware de vérification du JWT
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token manquant" });
    }

    // Le format attendu est : "Bearer eyJhbGci..."
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Format de token invalide" });
    }

    // 2. Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as {
      userId: string;
      email: string;
    };

    // 3. Attacher les infos utilisateur à la requête
    req.user = decoded;

    // 4. Passer au contrôleur suivant
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
};