import { Request, Response } from "express";
import { pool } from "../lib/db";
import axios from "axios";

const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY;

// Function to exchange monoCode
export async function exchangeMonoCode(req: Request, res: Response) {
  const { code } = req.body;
  const userId = (req as any).user.id;

  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const response = await axios.post(
      "https://api.withmono.com/account/auth",
      { code },
      { headers: { "mono-sec-key": MONO_SECRET_KEY } }
    );

    const { id: accountId, auth_token } = response.data;

    await pool.query(
      `INSERT INTO linked_accounts (user_id, account_id, access_token)
       VALUES ($1, $2, $3)
       ON CONFLICT (account_id)
       DO UPDATE SET access_token = EXCLUDED.access_token, updated_at = NOW()`,
      [userId, accountId, auth_token]
    );

    res.json({ success: true, accountId });
  } catch (err: any) {
    console.error("Error exchanging Mono code:", err.response?.data || err);
    res.status(500).json({ error: "Failed to link account" });
  }
}

// Function to get all accounts with their recent transactions
export async function getAccounts(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    // Fetch accounts
    const accountsResult = await pool.query(
      `
      SELECT id, name, type, balance, created_at
      FROM accounts
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    const accounts = accountsResult.rows;

    // Fetch recent transactions for all accounts
    const transactionsResult = await pool.query(
      `
      SELECT 
        t.id,
        t.account_id,
        t.description,
        t.category,
        t.amount,
        t.date
      FROM transactions t
      WHERE t.user_id = $1
      ORDER BY t.date DESC
      `,
      [userId]
    );

    // Attach transactions to their respective account
    const accountsWithTx = accounts.map((account: any) => ({
      ...account,
      recent_transactions: transactionsResult.rows
        .filter((tx) => tx.account_id === account.id)
        .slice(0, 5), // only latest 5
    }));

    res.json(accountsWithTx);
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
}
