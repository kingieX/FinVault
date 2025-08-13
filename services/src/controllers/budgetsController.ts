import { Request, Response } from "express";
import { pool } from "../lib/db";

// Function too get all budgets for the authenticated user
export async function getBudgets(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      "SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to create a new budget for the authenticated user
export async function createBudget(req: Request, res: Response) {
  const {
    category,
    limit_amount,
    spent_amount,
    month,
    year,
    icon = "card",
    color = "bg-primary",
    description,
    tags,
  } = req.body;

  if (!category || !limit_amount || !month || !year) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const userId = (req as any).user.id;

    // Ensure tags is always an array
    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.trim() !== ""
      ? tags.split(",").map((t) => t.trim())
      : [];

    const result = await pool.query(
      `INSERT INTO budgets 
        (user_id, category, limit_amount, spent_amount, month, year, icon, color, description, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        category,
        limit_amount,
        spent_amount || 0,
        month,
        year,
        icon,
        color,
        description || null,
        parsedTags || null,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating budget:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
