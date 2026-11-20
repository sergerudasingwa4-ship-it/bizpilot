import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { createSaleController, getCompanySalesController } from "./sale.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createSaleController);
router.get("/company/:companyId", getCompanySalesController);

export default router;