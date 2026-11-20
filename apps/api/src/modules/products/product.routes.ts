import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { createProductController, getProductsController } from "./product.controller";

const router = Router();
router.use(authMiddleware);
router.post("/", createProductController);
router.get("/company/:id", getProductsController);

export default router;