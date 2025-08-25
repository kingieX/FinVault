import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalById,
  topUpGoal,
} from "../controllers/goalsController";

const router = Router();

router.get("/", authMiddleware, getGoals);
router.get("/:id", authMiddleware, getGoalById);
router.post("/", authMiddleware, createGoal);
router.put("/:id", authMiddleware, updateGoal);
router.delete("/:id", authMiddleware, deleteGoal);

router.patch("/:id/top-up", authMiddleware, topUpGoal);

export default router;
