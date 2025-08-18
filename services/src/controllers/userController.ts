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
  try {
    const userId = (req as any).user.id;
    const userRes = await pool.query("SELECT * FROM users WHERE id=$1", [
      userId,
    ]);
    const user = userRes.rows[0];

    // If we already saved a mono_customer_id, reuse it
    // if (user.mono_customer_id) {
    //   return res.json({ customerId: user.mono_customer_id });
    // }

    // Otherwise, call Mono API to initiate account linking
    const resp = await axios.post(
      "https://api.withmono.com/v2/accounts/initiate",
      {
        customer: {
          name: user.name || `Sandbox User ${userId}`,
          email: user.email || `sandbox_${userId}@example.com`,
        },
        scope: "auth",
        redirect_url: "https://mono.co", // 👈 required field
        meta: { ref: `user_${userId}_${Date.now()}` },
      },
      {
        headers: {
          "mono-sec-key": MONO_SECRET_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
      }
    );

    const customerId = resp.data?.data?.customer || resp.data?.customer;
    // console.log("Mono customer ID:", resp.data);
    if (!customerId) {
      console.error("Invalid initiate response", resp.data);
      return res.status(500).json({ error: "Failed to create Mono customer" });
    }

    // Save to users table
    // await pool.query("UPDATE users SET mono_customer_id=$1 WHERE id=$2", [
    //   customerId,
    //   userId,
    // ]);

    return res.json({ customerId });
  } catch (err: any) {
    console.error("getOrCreateMonoCustomer error:", err.response?.data || err);
    return res.status(500).json({ error: "Failed to create mono customer" });
  }
}
