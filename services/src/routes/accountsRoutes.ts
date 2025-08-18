import express from "express";
import {
  exchangeMonoCode,
  getAccounts,
  initiateReauth,
  listLinkedAccounts,
  listUserTransactions,
} from "../controllers/accountsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { monoWebhook } from "../controllers/webhookController";

const router = express.Router();

// This route makes a GET request to fetch all accounts for the authenticated user
// router.get("/", authMiddleware, getAccounts);
router.get("/", authMiddleware, listLinkedAccounts);

router.get("/transactions", authMiddleware, listUserTransactions);

router.post("/link-account", authMiddleware, exchangeMonoCode);
router.post("/reauthorise", authMiddleware, initiateReauth); // optional helper to get a reauth link

router.post("/mono-webhook", monoWebhook); // public webhook

export default router;
