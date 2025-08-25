import cron from "node-cron";
import { pool } from "../lib/db";
import axios from "axios";

const CMC_API = "https://pro-api.coinmarketcap.com/v1/cryptocurrency";

// Run every hour (adjust as needed)
export async function portfolioHistory() {
  console.log("📊 Running portfolio history snapshot job...");
  try {
    // Get all portfolios
    const { rows: portfolios } = await pool.query(`
  SELECT DISTINCT user_id FROM portfolio
`);

    for (const p of portfolios) {
      const { rows: holdings } = await pool.query(
        `SELECT p.quantity, a.cmc_id
     FROM portfolio p
     JOIN assets a ON p.asset_id = a.id
     WHERE p.user_id = $1`,
        [p.user_id]
      );

      if (holdings.length === 0) continue;

      // Fetch latest prices from CMC
      const cmcIds = holdings.map((h) => h.cmc_id).join(",");
      const { data } = await axios.get(`${CMC_API}/quotes/latest`, {
        headers: { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY },
        params: { id: cmcIds },
      });

      let totalValue = 0;
      holdings.forEach((h) => {
        const price = data.data[h.cmc_id].quote.USD.price;
        totalValue += price * Number(h.quantity);
      });

      // Save snapshot
      await pool.query(
        `INSERT INTO portfolio_history (user_id, total_value) VALUES ($1, $2)`,
        [p.user_id, totalValue]
      );
    }
    console.log("✅ Portfolio history updated");
  } catch (err) {
    console.error("❌ Error updating portfolio history:", err);
  }
}

cron.schedule("0 * * * *", () => {
  console.log("⏳ Running hourly portfolio chart...");
  portfolioHistory();
});

// portfolioHistory().catch((err) => {
//   console.error("Error running portfolio chart sync:", err.message);
// });
