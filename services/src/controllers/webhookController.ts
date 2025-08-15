import axios from "axios";
import { pool } from "../lib/db";
import { Request, Response } from "express";

const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY;

export async function monoWebhook(req: Request, res: Response) {
  const { event, data } = req.body;

  // Log everything in sandbox mode for debugging
  if (process.env.MONO_ENVIRONMENT === "sandbox") {
    console.log("🔔 Incoming Mono Webhook:", JSON.stringify(req.body, null, 2));
  }

  if (!event || !data) {
    return res.status(400).send("Invalid request");
  }

  // Handle transactions event
  if (event === "mono.events.transactions") {
    const accountId = data.account_id;
    if (!accountId) {
      console.error("⚠️ Missing account_id in webhook data:", data);
      return res.status(400).send("Missing account_id");
    }

    // Fetch linked account from DB
    const accRes = await pool.query(
      `SELECT user_id, access_token FROM linked_accounts WHERE account_id = $1`,
      [accountId]
    );

    if (accRes.rowCount === 0) {
      console.warn("⚠️ No linked account found for account_id:", accountId);
      return res.status(404).send("Account not found");
    }

    const { access_token, user_id } = accRes.rows[0];

    try {
      // Fetch latest transactions from Mono API
      const txRes = await axios.get(
        `https://api.withmono.com/accounts/${accountId}/transactions`,
        {
          headers: {
            "mono-sec-key": MONO_SECRET_KEY,
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const transactions = txRes.data?.data || [];

      if (process.env.MONO_ENVIRONMENT === "sandbox") {
        console.log(
          `📄 Retrieved ${transactions.length} transactions from Mono`
        );
      }

      if (transactions.length === 0) {
        return res.status(200).send("No transactions to process");
      }

      // Save transactions to DB
      for (const tx of transactions) {
        await pool.query(
          `INSERT INTO transactions (user_id, description, amount, category, date, source)
           VALUES ($1, $2, $3, $4, $5, 'linked_account')
           ON CONFLICT DO NOTHING`,
          [user_id, tx.narration, tx.amount, tx.type, tx.date]
        );
      }
    } catch (error: any) {
      console.error(
        "❌ Error fetching transactions:",
        error.response?.data || error.message
      );
      return res.status(500).send("Error fetching transactions");
    }
  }

  res.status(200).send("OK");
}
