import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "../controllers/portfolioController";

const router = express.Router();

router.get("/", authMiddleware, getPortfolio); // Get portfolio summary
router.post("/", authMiddleware, createPortfolio); // Create a new portfolio asset
router.put("/:id", authMiddleware, updatePortfolio); // Update an existing portfolio asset
router.delete("/:id", authMiddleware, deletePortfolio);

export default router;
