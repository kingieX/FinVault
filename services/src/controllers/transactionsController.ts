import { Request, Response } from "express";
import { pool } from "../lib/db";

// Function to get all transactions for the authenticated user
export async function getTransactions(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const result = await pool.query(
      `
      SELECT 
        t.id,
        t.description,
        t.category,
        t.amount,
        t.date,
        t.created_at,
        a.name AS account_name,
        a.type AS account_type
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = $1
      ORDER BY t.date DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
}
