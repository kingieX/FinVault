import express from "express";
import { getAccounts } from "../controllers/accountsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// This route makes a GET request to fetch all accounts for the authenticated user
router.get("/", authMiddleware, getAccounts);

export default router;
