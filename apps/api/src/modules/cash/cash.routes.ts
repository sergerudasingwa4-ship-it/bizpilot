import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { getCashMovementsController, getCashBalanceController } from "./cash.controller";

const router = Router();

router.use(authMiddleware);

router.get("/company/:companyId/movements", getCashMovementsController);
router.get("/company/:companyId/balance", getCashBalanceController);

export default router;