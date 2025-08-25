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

// Function to get a single budget by ID
export async function getBudgetById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      "SELECT * FROM budgets WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching budget:", err);
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

// Function to update an existing budget
export async function updateBudget(req: Request, res: Response) {
  const { id } = req.params;
  const {
    category,
    limit_amount,
    spent_amount,
    month,
    year,
    icon,
    color,
    description,
    tags,
  } = req.body;

  try {
    const userId = (req as any).user.id;

    // Check if the budget exists and belongs to the user
    const checkBudget = await pool.query(
      "SELECT * FROM budgets WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (checkBudget.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Budget not found or unauthorized" });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.trim() !== ""
      ? tags.split(",").map((t) => t.trim())
      : null;

    // Update query with RETURNING * to get the updated row
    const result = await pool.query(
      `UPDATE budgets
      SET 
        category = COALESCE($1, category), 
        limit_amount = COALESCE($2, limit_amount), 
        spent_amount = COALESCE($3, spent_amount), 
        month = COALESCE($4, month),
        year = COALESCE($5, year),
        icon = COALESCE($6, icon),
        color = COALESCE($7, color),
        description = COALESCE($8, description),
        tags = COALESCE($9, tags)
      WHERE id = $10 AND user_id = $11
      RETURNING *`,
      [
        category,
        limit_amount,
        spent_amount,
        month,
        year,
        icon,
        color,
        description,
        parsedTags,
        id,
        userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating budget:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to delete an existing budget
export async function deleteBudget(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const userId = (req as any).user.id;

    // Delete query with a WHERE clause to ensure the user owns the budget
    const result = await pool.query(
      "DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Budget not found or unauthorized" });
    }

    res.json({ message: "Budget deleted successfully", id: result.rows[0].id });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// FUnction to update spending
export async function updateSpentAmount(req: Request, res: Response) {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    const userId = (req as any).user.id;

    const currentBudget = await pool.query(
      "SELECT spent_amount FROM budgets WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (currentBudget.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Budget not found or unauthorized" });
    }

    const currentSpentAmount = parseFloat(currentBudget.rows[0].spent_amount);
    const amountToUpdate = parseFloat(amount);

    if (isNaN(amountToUpdate) || amountToUpdate <= 0) {
      return res.status(400).json({ error: "Invalid amount provided" });
    }

    const newSpentAmount = currentSpentAmount + amountToUpdate;

    const result = await pool.query(
      `UPDATE budgets
      SET spent_amount = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *`,
      [newSpentAmount, id, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating spent amount:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
