import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret"; // set in .env

// Function to sign up a new user
export async function signup(req: Request, res: Response) {
  const { email, password, name } = req.body;
  // console.log(req.body);
  if (!email || !password || !name)
    return res
      .status(400)
      .json({ error: "Name, email and password are required" });

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3) RETURNING id, email, name, created_at`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ user, token });
  } catch (err: any) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Email already exists" });
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// function to log in an existing user
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  // console.log(req.body);
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
