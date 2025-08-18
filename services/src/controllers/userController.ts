import { Request, Response } from "express";
import { pool } from "../lib/db";
import axios from "axios";

const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY;

// Function to get current user details
export function getMe(req: Request, res: Response) {
  res.json((req as any).user);
}

// function to get mono-customer
export async function getOrCreateMonoCustomer(req: Request, res: Response) {
  const userId = (req as any).user.id;

  try {
    const { rows } = await pool.query(
      "SELECT mono_customer_id, name, email FROM users WHERE id = $1",
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    let { mono_customer_id, name, email } = rows[0];

    if (mono_customer_id) {
      return res.json({ customerId: mono_customer_id });
    }

    // Try Mono “customers” endpoint if available to you
    try {
      const resp = await axios.post(
        "https://api.withmono.com/customers",
        { customer: { id: String(userId), name, email } },
        {
          headers: {
            "mono-sec-key": MONO_SECRET_KEY,
            accept: "application/json",
          },
        }
      );
      mono_customer_id = resp.data?.id || resp.data?.data?.id || String(userId);
    } catch {
      // Fallback to deterministic string
      mono_customer_id = `user_${userId}`;
    }

    await pool.query("UPDATE users SET mono_customer_id = $1 WHERE id = $2", [
      mono_customer_id,
      userId,
    ]);

    return res.json({ customerId: mono_customer_id });
  } catch (err: any) {
    console.error("getOrCreateMonoCustomer error:", err?.response?.data || err);
    return res
      .status(500)
      .json({ error: "Failed to get/create mono customer id" });
  }
}
