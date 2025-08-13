import { pool } from "./lib/db";

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database time:", res.rows[0]);
  } catch (err) {
    console.error("DB connection error:", err);
  } finally {
    pool.end();
  }
})();
