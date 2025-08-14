import { Request, Response } from "express";
import { pool } from "../lib/db";

// Get all notifications for the logged-in user
export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Create a notification
export async function createNotification(req: Request, res: Response) {
  const { title, message, type } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, message, type || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Mark notification as read
export async function markNotificationRead(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const userId = (req as any).user.id;
    await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get unread notification count
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM notifications
       WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );
    res.json({ count: rows[0].count });
    // console.log("Unread notifications count:", rows[0].count);
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Register device token for push notifications
export async function registerDeviceToken(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { expo_push_token } = req.body;
  if (!expo_push_token)
    return res.status(400).json({ error: "expo_push_token required" });

  try {
    const upsert = await pool.query(
      `INSERT INTO user_device_tokens (user_id, expo_push_token)
       VALUES ($1, $2)
       ON CONFLICT (user_id, expo_push_token)
       DO UPDATE SET last_seen_at = NOW()
       RETURNING *`,
      [userId, expo_push_token]
    );
    res.json(upsert.rows[0]);
  } catch (err) {
    console.error("registerDeviceToken error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// List notifications for the user
export async function listNotifications(req: Request, res: Response) {
  const userId = (req as any).user.id;
  try {
    const r = await pool.query(
      `SELECT id, title, message, type, created_at, read_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("listNotifications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Mark a single notification as read
export async function markRead(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { id } = req.params;
  try {
    const r = await pool.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error("markRead error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
