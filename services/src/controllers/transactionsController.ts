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
        la.account_name,
        la.type AS account_type,
        la.institution_name
      FROM transactions t
      JOIN linked_accounts la ON t.account_id = la.account_id
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
