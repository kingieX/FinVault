import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getNotifications,
  createNotification,
  markNotificationRead,
  registerDeviceToken,
  listNotifications,
  markRead,
  getUnreadCount,
} from "../controllers/notificationsController";

const router = express.Router();

router.get("/", authMiddleware, getNotifications); // /api/v1/notifications
router.post("/", authMiddleware, createNotification); // Create a new notification
router.patch("/:id/read", authMiddleware, markNotificationRead); // Mark a notification as read
router.get("/unread-count", authMiddleware, getUnreadCount); // Get unread notification count

router.post("/device-token", authMiddleware, registerDeviceToken); // body: { expo_push_token }
router.get("/", authMiddleware, listNotifications); // /api/v1/notifications
router.post("/:id/read", authMiddleware, markRead); // mark a single notification read

export default router;
