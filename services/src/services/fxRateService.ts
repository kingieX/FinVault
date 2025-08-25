import axios from "axios";
import { pool } from "../lib/db";

const OPEN_EXCHANGE_URL = "https://open.er-api.com/v6/latest/USD";

// Function to fetch and cache Rate
export async function fetchAndCacheFxRate(base = "USD", target = "NGN") {
  try {
    const res = await axios.get(OPEN_EXCHANGE_URL);

    if (res.data.result !== "success") {
      throw new Error("Rate API returned failure");
    }

    const rate = res.data.rates[target]; // ✅ fixed: use rates, not conversion_rates
    if (!rate) throw new Error(`No rate found for ${target}`);

    await pool.query(
      `INSERT INTO fx_rates (base_currency, target_currency, rate, updated_at)
       VALUES ($1,$2,$3,now())
       ON CONFLICT (base_currency, target_currency)
       DO UPDATE SET rate = EXCLUDED.rate, updated_at = now()`,
      [base, target, rate]
    );

    console.log(`💱 USD → ${target}: ${rate}`);
    return rate;
  } catch (err: any) {
    console.error("❌ FX fetch error:", err.message);
    return null;
  }
}

// FUnction to get Rate
export async function getCachedFxRate(base = "USD", target = "NGN") {
  const { rows } = await pool.query(
    `SELECT rate FROM fx_rates 
     WHERE base_currency = $1 AND target_currency = $2 
     AND updated_at > now() - interval '24 hours' 
     LIMIT 1`,
    [base, target]
  );

  if (rows.length > 0) {
    return rows[0].rate;
  }

  // If not in cache or expired → fetch and cache fresh
  return fetchAndCacheFxRate(base, target);
}
