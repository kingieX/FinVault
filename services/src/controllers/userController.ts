import { Request, Response } from "express";
import { pool } from "../lib/db";
import axios from "axios";
import bcrypt from "bcrypt";

const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY;

// Function to get current user details
export function getMe(req: Request, res: Response) {
  res.json((req as any).user);
}

// Function to get user profile
export async function getUserProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { rows } = await pool.query(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
    console.log("User: ", res.json(rows[0]));
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
}

// Function to update user profile
export async function updateUserProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    const { rows } = await pool.query(
      `UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email`,
      [name, email, userId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

// Function to update user password
export async function updatePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    const { rows } = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid)
      return res.status(400).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [
      hashed,
      userId,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
}

// FUnction to logout user
export async function logoutUser(req: Request, res: Response) {
  try {
    // With JWT, logout is just handled client-side (remove token).
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error logging out:", err);
    res.status(500).json({ error: "Failed to logout" });
  }
}

// Function to delete account
export async function deleteAccount(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
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
