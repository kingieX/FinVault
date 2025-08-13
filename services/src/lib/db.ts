import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Neon requires SSL
  },
});

pool.on("connect", () => {
  console.log("✅ Connected to Neon Postgres");
});
