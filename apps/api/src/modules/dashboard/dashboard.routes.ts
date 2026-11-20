import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { getDashboardController } from "./dashboard.controller";

const router = Router();

router.use(authMiddleware);

router.get("/company/:companyId", getDashboardController);

export default router;