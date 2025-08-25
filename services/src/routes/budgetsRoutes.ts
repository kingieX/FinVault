import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getBudgets,
  createBudget,
  getBudgetById,
  updateBudget,
  deleteBudget,
  updateSpentAmount,
} from "../controllers/budgetsController";

const router = Router();

router.get("/", authMiddleware, getBudgets);
router.post("/", authMiddleware, createBudget);
router.get("/:id", authMiddleware, getBudgetById);
router.put("/:id", authMiddleware, updateBudget);
router.delete("/:id", authMiddleware, deleteBudget);

// new route for updating spent amount
router.patch("/:id/spent", authMiddleware, updateSpentAmount);
export default router;
