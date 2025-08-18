import express from "express";
import { getMe, getOrCreateMonoCustomer } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
// Endpoint to get Mono customer ID
router.get("/mono-customer", authMiddleware, getOrCreateMonoCustomer);

export default router;
