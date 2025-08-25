import express from "express";
import {
  deleteAccount,
  getMe,
  getOrCreateMonoCustomer,
  getUserProfile,
  logoutUser,
  updatePassword,
  updateUserProfile,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/me", authMiddleware, getMe);

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.put("/password", authMiddleware, updatePassword);
router.post("/logout", authMiddleware, logoutUser);
router.delete("/delete", authMiddleware, deleteAccount);

// Endpoint to get Mono customer ID
router.get("/mono-customer", authMiddleware, getOrCreateMonoCustomer);

export default router;
