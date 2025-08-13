import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getGoals, createGoal } from "../controllers/goalsController";

const router = Router();

router.get("/", authMiddleware, getGoals);
router.post("/", authMiddleware, createGoal);

export default router;
