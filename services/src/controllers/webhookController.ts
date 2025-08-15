import axios from "axios";
import { pool } from "../lib/db";
import { Request, Response } from "express";

const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY;

export async function monoWebhook(req: Request, res: Response) {
  const { event, data } = req.body;
  if (!event || !data) {
    return res.status(400).send("Invalid request");
  }

  if (event === "mono.events.transactions") {
    const accountId = data.account_id;

    const accRes = await pool.query(
      `SELECT user_id, access_token FROM linked_accounts WHERE account_id = $1`,
      [accountId]
    );
    if (accRes.rowCount === 0) return res.status(404).send("Account not found");

    const { access_token, user_id } = accRes.rows[0];

    const txRes = await axios.get(
      `https://api.withmono.com/accounts/${accountId}/transactions`,
      {
        headers: {
          "mono-sec-key": MONO_SECRET_KEY,
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const transactions = txRes.data.data;
    if (!transactions || transactions.length === 0) {
      return res.status(200).send("No transactions to process");
    }
    for (const tx of transactions) {
      await pool.query(
        `INSERT INTO transactions (user_id, description, amount, category, date, source)
         VALUES ($1, $2, $3, $4, $5, 'linked_account')
         ON CONFLICT DO NOTHING`,
        [user_id, tx.narration, tx.amount, tx.type, tx.date]
      );
    }
  }

  res.status(200).send("OK");
}
