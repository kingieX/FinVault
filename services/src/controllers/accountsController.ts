import { Request, Response } from "express";
import axios from "axios";
import { pool } from "../lib/db";

const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY!;

export async function listLinkedAccounts(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const { rows } = await pool.query(
      `
      SELECT 
        la.account_id,
        la.account_name,
        la.institution_name,
        la.account_number,
        la.type,
        la.currency,
        la.balance,
        la.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'description', t.description,
              'amount', t.amount,
              'date', t.date,
              'category', t.category
            )
            ORDER BY t.date DESC
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) AS recent_transactions
      FROM linked_accounts la
      LEFT JOIN LATERAL (
        SELECT *
        FROM transactions t
        WHERE t.account_id = la.account_id AND t.user_id = $1
        ORDER BY t.date DESC
        LIMIT 5
      ) t ON TRUE
      WHERE la.user_id = $1
      GROUP BY 
        la.account_id,
        la.account_name,
        la.institution_name,
        la.account_number,
        la.type,
        la.currency,
        la.balance,
        la.updated_at
      ORDER BY la.updated_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching accounts with transactions:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
}

export async function listUserTransactions(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { rows } = await pool.query(
    `SELECT * FROM transactions
     WHERE user_id = $1
     ORDER BY date DESC
     LIMIT 500`,
    [userId]
  );
  res.json(rows);
}

export async function exchangeMonoCode(req: Request, res: Response) {
  const { code } = req.body;
  const userId = (req as any).user.id;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    // 1) Exchange code for account id
    const authResp = await axios.post(
      "https://api.withmono.com/v2/accounts/auth",
      { code },
      {
        headers: {
          "mono-sec-key": MONO_SECRET_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
      }
    );

    const accountId = authResp.data?.data?.id || authResp.data?.id;
    // console.log("Mono account ID:", accountId);
    if (!accountId) {
      console.error("Invalid /v2/accounts/auth response", authResp.data);
      return res.status(500).json({ error: "Invalid response from Mono" });
    }

    // 2) Fetch account details
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
    // console.log("Mono account details:", acct);

    // 3) Fetch balance
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

    // console.log("Mono account balance:", balance);

    // 4) Upsert linked account
    await pool.query(
      `INSERT INTO linked_accounts
    (user_id, account_id, institution_name, institution_code, institution_type,
     account_name, account_number, type, bvn, currency, balance, updated_at)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
   ON CONFLICT (account_id)
   DO UPDATE SET institution_name   = EXCLUDED.institution_name,
                 institution_code   = EXCLUDED.institution_code,
                 institution_type   = EXCLUDED.institution_type,
                 account_name       = EXCLUDED.account_name,
                 account_number     = EXCLUDED.account_number,
                 type               = EXCLUDED.type,
                 bvn                = EXCLUDED.bvn,
                 currency           = EXCLUDED.currency,
                 balance            = EXCLUDED.balance,
                 updated_at         = NOW()`,
      [
        userId,
        accountId,
        acct?.institution?.name || null,
        acct?.institution?.bank_code || null,
        acct?.institution?.type || null,
        acct?.name || null,
        acct?.account_number || null,
        acct?.type || null,
        acct?.bvn || null,
        acct?.currency || null,
        balance,
      ]
    );

    // 5) Initial transactions sync (page 1 only here; extend as needed)
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
    // console.log("Mono transactions:", txs);
    if (Array.isArray(txs)) {
      for (const t of txs) {
        await pool.query(
          `INSERT INTO transactions
        (user_id, account_id, mono_tx_id, description, amount, type, balance_after, category, currency, date, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'linked_account')
       ON CONFLICT (mono_tx_id) DO NOTHING`,
          [
            userId,
            accountId,
            t.id, // mono_tx_id
            t.narration, // description
            t.type === "debit"
              ? -Math.abs(Number(t.amount))
              : Math.abs(Number(t.amount)), // amount signed properly
            t.type, // type
            t.balance ?? null, // balance_after
            t.category ?? null, // category
            t.currency ?? null, // currency
            t.date, // date
          ]
        );
      }
    }

    return res.json({ success: true, accountId });
  } catch (err: any) {
    console.error("exchangeMonoCode error:", err?.response?.data || err);
    return res.status(500).json({ error: "Failed to link account" });
  }
}

// OPTIONAL: build a reauth link for an existing account
export async function initiateReauth(req: Request, res: Response) {
  const { accountId, redirect_url } = req.body;
  if (!accountId) return res.status(400).json({ error: "Missing accountId" });

  try {
    const resp = await axios.post(
      "https://api.withmono.com/v2/accounts/initiate",
      {
        scope: "reauth",
        account: accountId,
        redirect_url: redirect_url || "https://mono.co",
        meta: { ref: `reauth_${accountId}_${Date.now()}` },
      },
      {
        headers: {
          "mono-sec-key": MONO_SECRET_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
      }
    );

    const mono_url = resp.data?.data?.mono_url || resp.data?.mono_url;
    return res.json({ mono_url });
  } catch (err: any) {
    console.error("initiateReauth error:", err?.response?.data || err);
    return res.status(500).json({ error: "Failed to initiate reauth" });
  }
}

// Fetch all linked accounts for logged-in user
export async function getAccounts(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const result = await pool.query(
      `SELECT account_id, balance, created_at, updated_at
       FROM linked_accounts
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
}

// Function to unlink account
export async function unlinkAccount(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: "accountId is required" });
  }

  try {
    // 1) Call Mono unlink endpoint
    const resp = await axios.post(
      `https://api.withmono.com/v2/accounts/${accountId}/unlink`,
      {},
      {
        headers: {
          "mono-sec-key": MONO_SECRET_KEY,
          accept: "application/json",
        },
      }
    );

    // 2) Delete related transactions first
    await pool.query(
      `DELETE FROM transactions WHERE user_id = $1 AND account_id = $2`,
      [userId, accountId]
    );

    // 3) Delete account record
    await pool.query(
      `DELETE FROM linked_accounts WHERE user_id = $1 AND account_id = $2`,
      [userId, accountId]
    );

    res.json({
      success: true,
      message: "Account and transactions unlinked successfully",
      monoResponse: resp.data,
    });
  } catch (err: any) {
    console.error("unlinkAccount error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: "Failed to unlink account", details: err.response?.data });
  }
}

// Function to get all accounts with their recent transactions

// export async function getAccounts(req: Request, res: Response) {
//   try {
//     const userId = (req as any).user.id;

//     // Fetch accounts
//     const accountsResult = await pool.query(
//       `
//       SELECT id, name, type, balance, created_at
//       FROM accounts
//       WHERE user_id = $1
//       ORDER BY created_at DESC
//       `,
//       [userId]
//     );

//     const accounts = accountsResult.rows;

// Fetch recent transactions for all accounts
//     const transactionsResult = await pool.query(
//       `
//       SELECT
//         t.id,
//         t.account_id,
//         t.description,
//         t.category,
//         t.amount,
//         t.date
//       FROM transactions t
//       WHERE t.user_id = $1
//       ORDER BY t.date DESC
//       `,
//       [userId]
//     );

//     // Attach transactions to their respective account
//     const accountsWithTx = accounts.map((account: any) => ({
//       ...account,
//       recent_transactions: transactionsResult.rows
//         .filter((tx) => tx.account_id === account.id)
//         .slice(0, 5), // only latest 5
//     }));

//     res.json(accountsWithTx);
//   } catch (err) {
//     console.error("Error fetching accounts:", err);
//     res.status(500).json({ error: "Failed to fetch accounts" });
//   }
// }
