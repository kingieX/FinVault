import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getBudgets, createBudget } from "../controllers/budgetsController";

const router = Router();

router.get("/", authMiddleware, getBudgets);
router.post("/", authMiddleware, createBudget);

export default router;
