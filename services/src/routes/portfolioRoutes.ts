import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  addAsset,
  getAllAssets,
  getAssetDetail,
  getAssetPrice,
  getPortfolio,
  getPortfolioHistory,
  getTrending,
  searchAssets,
} from "../controllers/portfolioController";

const router = express.Router();

router.get("/all-assets", getAllAssets); // Get all assets
router.get("/assets", searchAssets); // Search for assets
router.post("/add", authMiddleware, addAsset); // Add an asset to the portfolio
router.get("/", authMiddleware, getPortfolio); // Get user's portfolio
router.get("/trending", getTrending); // Get trending assets

router.get("/price", getAssetPrice); // Get live price of asset

router.get("/asset/:id", authMiddleware, getAssetDetail); // get single asset detail

router.get("/history", authMiddleware, getPortfolioHistory); // get portfolio history for charts

export default router;
