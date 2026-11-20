import { Response } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import { createCompany, getUserCompanies, getCompanyById } from "./company.service";

export const createCompanyController = async (req: AuthRequest, res: Response) => {
  try {
    const { name, currency } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });
    if (!name) return res.status(400).json({ error: "Le nom de l'entreprise est requis" });
    const company = await createCompany(name, userId, currency || "RWF");
    res.status(201).json({ message: "Entreprise créée avec succès", data: company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getMyCompaniesController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });
    const companies = await getUserCompanies(userId);
    res.status(200).json({ message: "Entreprises récupérées", data: companies });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getCompanyController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });
    const company = await getCompanyById(id, userId);
    if (!company) return res.status(404).json({ error: "Entreprise non trouvée ou accès refusé" });
    res.status(200).json({ message: "Entreprise récupérée", data: company });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};