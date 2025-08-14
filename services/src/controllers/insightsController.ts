import { Request, Response } from "express";
import { pool } from "../lib/db";
import { generateSpendingInsights } from "../services/insightService";

// POST /api/v1/insights/generate-now
// - if "all=true" (admin/testing), run for all users
// - otherwise run for the current user
export async function generateNow(req: Request, res: Response) {
  try {
    const all = String(req.query.all || "false") === "true";

    if (all) {
      const { rows: users } = await pool.query(`SELECT id FROM users`);
      let total = 0;
      for (const u of users) {
        const r = await generateSpendingInsights(u.id);
        total += r.created;
      }
      return res.json({ status: "ok", created: total, scope: "all" });
    }

    const userId = (req as any).user.id;
    const result = await generateSpendingInsights(userId);
    return res.json({ status: "ok", ...result, scope: "me" });
  } catch (err) {
    console.error("generateNow error:", err);
    res.status(500).json({ error: "Failed to generate insights" });
  }
}

// GET /api/v1/insights  -> returns latest insight notifications
export async function getInsights(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const limit = Math.min(Number(req.query.limit || 10), 50);

    const { rows } = await pool.query(
      `
      SELECT id, title, message, type, created_at, is_read
      FROM notifications
      WHERE user_id = $1 AND type = 'insight'
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    res.json(rows);
    // console.log(`Fetched ${rows.length} insights for user ${userId}`);
  } catch (err) {
    console.error("getInsights error:", err);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
}
