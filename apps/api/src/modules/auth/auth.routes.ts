import { Router } from "express";
import { loginController, getMeController } from "./auth.controller";
import { authMiddleware } from "./auth.middleware";

const router = Router();

router.post("/login", loginController);
router.get("/me", authMiddleware, getMeController);

export default router;