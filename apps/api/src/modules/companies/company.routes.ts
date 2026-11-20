import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { createCompanyController, getMyCompaniesController, getCompanyController } from "./company.controller";

const router = Router();
router.use(authMiddleware);
router.post("/", createCompanyController);
router.get("/", getMyCompaniesController);
router.get("/:id", getCompanyController);

export default router;