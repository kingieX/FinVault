import { Request, Response } from "express";
import axios from "axios";
import { pool } from "../lib/db";

const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY!;

export async function monoWebhook(req: Request, res: Response) {
  try {
    const { event, data } = req.body || {};
    // You may verify signature here if Mono signs requests (MONO_WEBHOOK_SECRET)

    // Common events to re-sync:
    //  - data.status becomes AVAILABLE
    //  - mono.events.transactions or similar
    //  - consult your Mono dashboard for exact event names in sandbox/live
    const accountId: string | undefined =
      data?.account_id || data?.account || data?.id;

    if (accountId) {
      // find our user for this account (if present)
      const acc = await pool.query(
        "SELECT user_id FROM linked_accounts WHERE account_id = $1",
        [accountId]
      );
      const user_id = acc.rows[0]?.user_id;

      // Always refresh balance & recent transactions
      // 1) Account details
      const acctResp = await axios.get(
        `https://api.withmono.com/v2/accounts/${accountId}`,
        {
          headers: {
            "mono-sec-key": MONO_SECRET_KEY,
            accept: "application/json",
          },
        }
      );
      const acct = acctResp.data?.data?.account || acctResp.data?.account;

      // 2) Balance
      const balResp = await axios.get(
        `https://api.withmono.com/v2/accounts/${accountId}/balance`,
        {
          headers: {
            "mono-sec-key": MONO_SECRET_KEY,
            accept: "application/json",
          },
        }
      );
      const balance =
        balResp.data?.data?.balance ?? balResp.data?.balance ?? null;

      await pool.query(
        `UPDATE linked_accounts
           SET institution_name=$2, account_name=$3, account_number=$4, currency=$5, balance=$6, updated_at=NOW()
         WHERE account_id=$1`,
        [
          accountId,
          acct?.institution?.name || null,
          acct?.name || null,
          acct?.account_number || null,
          acct?.currency || null,
          balance,
        ]
      );

      // 3) Transactions (page 1)
      const txResp = await axios.get(
        `https://api.withmono.com/v2/accounts/${accountId}/transactions`,
        {
          headers: {
            "mono-sec-key": MONO_SECRET_KEY,
            accept: "application/json",
          },
        }
      );
      const txs = txResp.data?.data || [];
      if (user_id && Array.isArray(txs)) {
        for (const t of txs) {
          await pool.query(
            `INSERT INTO transactions
              (user_id, account_id, mono_tx_id, narration, amount, type, balance_after, category, date, source)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'linked_account')
             ON CONFLICT (mono_tx_id) DO NOTHING`,
            [
              user_id,
              accountId,
              t.id,
              t.narration,
              t.type === "debit"
                ? -Math.abs(Number(t.amount))
                : Math.abs(Number(t.amount)),
              t.type,
              t.balance ?? null,
              t.category ?? null,
              t.date,
            ]
          );
        }
      }
    }

    res.status(200).send("OK");
  } catch (err: any) {
    console.error("monoWebhook error:", err?.response?.data || err);
    res.status(200).send("OK"); // acknowledge anyway so Mono doesn't retry forever
  }
}
