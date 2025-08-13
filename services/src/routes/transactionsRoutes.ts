import express from "express";
import { getTransactions } from "../controllers/transactionsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// This route makes a GET request to fetch all transactions for the authenticated user
router.get("/", authMiddleware, getTransactions);

export default router;
