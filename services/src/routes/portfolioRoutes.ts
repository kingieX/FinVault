import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  addAsset,
  getPortfolio,
  getTrending,
  searchAssets,
} from "../controllers/portfolioController";

const router = express.Router();

router.get("/assets", searchAssets); // Search for assets
router.post("/add", authMiddleware, addAsset); // Add an asset to the portfolio
router.get("/", authMiddleware, getPortfolio); // Get user's portfolio
router.get("/trending", getTrending); // Get trending assets

export default router;
