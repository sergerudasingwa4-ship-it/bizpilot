import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import {
  createExpenseController,
  getCompanyExpensesController,
  getExpensesByCategoryController,
} from "./expense.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createExpenseController);
router.get("/company/:companyId", getCompanyExpensesController);
router.get("/company/:companyId/stats", getExpensesByCategoryController);

export default router;