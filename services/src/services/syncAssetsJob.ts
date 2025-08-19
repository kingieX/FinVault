import cron from "node-cron";
import axios from "axios";
import { pool } from "../lib/db";

const CMC_API_KEY = process.env.CMC_API_KEY;
const BASE_URL = "https://pro-api.coinmarketcap.com/v1";

export async function syncAssets() {
  try {
    console.log("🔄 Syncing assets from CoinMarketCap...");

    // 1) Fetch latest listings (top 500 or paginate)
    const listings = await axios.get(
      `${BASE_URL}/cryptocurrency/listings/latest`,
      {
        headers: { "X-CMC_PRO_API_KEY": CMC_API_KEY },
        params: { start: 1, limit: 500 },
      }
    );

    const assets = listings.data.data;

    // 2) Collect IDs for fetching logos
    const ids = assets.map((a: any) => a.id).join(",");

    // 3) Fetch metadata (logos)
    const infoRes = await axios.get(`${BASE_URL}/cryptocurrency/info`, {
      headers: { "X-CMC_PRO_API_KEY": CMC_API_KEY },
      params: { id: ids },
    });

    const info = infoRes.data.data;
    // console.log("one asset: ", in);

    // 4) Upsert into DB
    for (const a of assets) {
      const meta = info[a.id];

      await pool.query(
        `
        INSERT INTO assets (
          cmc_id, rank, symbol, name, slug, type, is_active, status,
          first_historical_data, last_historical_data, platform, logo_url
        )
        VALUES ($1,$2,$3,$4,$5,'crypto',$6,$7,$8,$9,$10,$11)
        ON CONFLICT (cmc_id) DO UPDATE SET
          rank = EXCLUDED.rank,
          symbol = EXCLUDED.symbol,
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          is_active = EXCLUDED.is_active,
          status = EXCLUDED.status,
          first_historical_data = EXCLUDED.first_historical_data,
          last_historical_data = EXCLUDED.last_historical_data,
          platform = EXCLUDED.platform,
          logo_url = EXCLUDED.logo_url
        `,
        [
          a.id,
          a.cmc_rank,
          a.symbol,
          a.name,
          a.slug,
          a.is_active,
          1, // status
          a.first_historical_data,
          a.last_historical_data,
          a.platform ? JSON.stringify(a.platform) : null,
          meta?.logo || null,
        ]
      );
    }

    console.log(`✅ Synced ${assets.length} assets`);
  } catch (err) {
    console.error("❌ Error syncing assets:", err);
  }
}

// Run once at 2am every day
cron.schedule("0 2 * * *", () => {
  console.log("⏳ Running daily CoinMarketCap sync...");
  syncAssets();
});

// Run immediately on startup
// syncAssets().catch((err) => {
//   console.error("❌ Error running initial sync:", err.message);
// });
