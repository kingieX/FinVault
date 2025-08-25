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

// Function to get a single goal for the authenticated user
export async function getGoalById(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching single goal:", err);
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

// Function to update an existing goal
export async function updateGoal(req: Request, res: Response) {
  const { id } = req.params; // Get goal ID from URL parameters
  const { name, target_amount, saved_amount, deadline, category, icon } =
    req.body; // Get fields to update from request body

  try {
    const userId = (req as any).user.id;

    // Check if the goal exists and belongs to the authenticated user
    const checkGoal = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (checkGoal.rows.length === 0) {
      return res.status(404).json({ error: "Goal not found or unauthorized" });
    }

    // Perform the update query for the fields provided in the request
    const result = await pool.query(
      `UPDATE goals
       SET name = $1, target_amount = $2, saved_amount = $3, deadline = $4, category = $5, icon = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, target_amount, saved_amount, deadline, category, icon, id, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to top up amount
export async function topUpGoal(req: Request, res: Response) {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    const userId = (req as any).user.id;

    // 1. Fetch the current saved amount to perform the calculation on the server
    const currentGoal = await pool.query(
      "SELECT saved_amount FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (currentGoal.rows.length === 0) {
      return res.status(404).json({ error: "Goal not found or unauthorized" });
    }

    const currentSavedAmount = parseFloat(currentGoal.rows[0].saved_amount);
    const topUpAmount = parseFloat(amount);

    // Validate the amount is a positive number
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount provided" });
    }

    // 2. Calculate the new saved amount
    const newSavedAmount = currentSavedAmount + topUpAmount;

    // 3. Update the goal with the new amount
    const result = await pool.query(
      `UPDATE goals
      SET saved_amount = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *`,
      [newSavedAmount, id, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error topping up goal:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to delete a goal
export async function deleteGoal(req: Request, res: Response) {
  const { id } = req.params; // Get goal ID from URL parameters

  try {
    const userId = (req as any).user.id;

    // Attempt to delete the goal, but only if it belongs to the user
    const result = await pool.query(
      "DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Goal not found or unauthorized" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
