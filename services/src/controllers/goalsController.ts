import { Request, Response } from "express";
import { pool } from "../lib/db";

// Function to get all goals for the authenticated user
export async function getGoals(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      "SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to create a new goal for the authenticated user
export async function createGoal(req: Request, res: Response) {
  const { name, target_amount, saved_amount, deadline, category, icon } =
    req.body;
  if (!name || !target_amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      `INSERT INTO goals (user_id, name, target_amount, saved_amount, deadline, category, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        name,
        target_amount,
        saved_amount || 0,
        deadline || null,
        category || null,
        icon || null,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
