import { Request, Response } from "express";
import { pool } from "../lib/db";
import axios from "axios";

const CMC_API = "https://pro-api.coinmarketcap.com/v1/cryptocurrency";

// Function to get search results for assets
export async function searchAssets(req: Request, res: Response) {
  try {
    const { search } = req.query;

    if (!search || typeof search !== "string") {
      return res.status(400).json({ error: "Search query required" });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        id,
        cmc_id,
        rank,
        symbol,
        name,
        slug,
        type,
        is_active,
        status,
        platform,
        logo_url
      FROM assets
      WHERE symbol ILIKE $1 OR name ILIKE $1 OR slug ILIKE $1
      ORDER BY rank ASC NULLS LAST
      LIMIT 10
      `,
      [`%${search}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error searching assets:", err);
    res.status(500).json({ error: "Failed to search assets" });
  }
}

// Function to add an asset to the portfolio
export async function addAsset(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { symbol, type, quantity, amount } = req.body;

    // 1) lookup asset in DB
    const { rows: assetRows } = await pool.query(
      `SELECT id, cmc_id, symbol FROM assets WHERE symbol=$1 AND type=$2`,
      [symbol, type]
    );
    if (assetRows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }
    const asset = assetRows[0];

    // 2) get current price from CMC
    const { data } = await axios.get(`${CMC_API}/quotes/latest`, {
      headers: { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY },
      params: { id: asset.cmc_id },
    });
    const price = data.data[asset.cmc_id].quote.USD.price;

    // 3) calculate quantity/value
    const finalQuantity = quantity ? Number(quantity) : Number(amount) / price;

    const investedValue = amount ? Number(amount) : finalQuantity * price;

    // 4) insert into portfolio
    await pool.query(
      `INSERT INTO portfolio (user_id, asset_id, quantity, invested_value)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, asset_id)
       DO UPDATE SET 
         quantity = EXCLUDED.quantity,
         invested_value = EXCLUDED.invested_value,
         updated_at = NOW()`,
      [userId, asset.id, finalQuantity, investedValue]
    );

    res.json({ success: true, symbol, quantity: finalQuantity, investedValue });
  } catch (err) {
    console.error("Error adding asset:", err);
    res.status(500).json({ error: "Failed to add asset" });
  }
}

// Function to get the user's portfolio
export async function getPortfolio(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const { rows: holdings } = await pool.query(
      `SELECT p.asset_id, p.quantity, a.symbol, a.name, a.cmc_id, a.type
       FROM portfolio p
       JOIN assets a ON p.asset_id = a.id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (holdings.length === 0) return res.json({ totalValue: 0, holdings: [] });

    // fetch prices in batch
    const cmcIds = holdings.map((h) => h.cmc_id).join(",");
    const { data } = await axios.get(`${CMC_API}/quotes/latest`, {
      headers: { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY },
      params: { id: cmcIds },
    });

    let totalValue = 0;
    const result = holdings.map((h) => {
      const price = data.data[h.cmc_id].quote.USD.price;
      const value = price * Number(h.quantity);
      totalValue += value;
      return {
        symbol: h.symbol,
        name: h.name,
        quantity: h.quantity,
        price,
        value,
      };
    });

    res.json({ totalValue, holdings: result });
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
}

// Function to get trending assets
export async function getTrending(req: Request, res: Response) {
  try {
    const { data } = await axios.get(`${CMC_API}/listings/latest`, {
      headers: { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY },
      params: { limit: 10, sort: "market_cap", convert: "USD" },
    });

    const trending = data.data.map((a) => ({
      symbol: a.symbol,
      name: a.name,
      price: a.quote.USD.price,
      percent_change_24h: a.quote.USD.percent_change_24h,
      market_cap: a.quote.USD.market_cap,
    }));

    res.json(trending);
  } catch (err) {
    console.error("Error fetching trending assets:", err);
    res.status(500).json({ error: "Failed to fetch trending assets" });
  }
}
