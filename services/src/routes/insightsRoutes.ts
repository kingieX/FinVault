import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { generateNow, getInsights } from "../controllers/insightsController";

const router = Router();

router.post("/generate-now", authMiddleware, generateNow); // Endpoint to generate insights immediately
router.get("/", authMiddleware, getInsights); // Endpoint to get latest insights

export default router;
