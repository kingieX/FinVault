import { Request, Response } from "express";
import { pool } from "../lib/db";
import axios from "axios";

const CMC_API = "https://pro-api.coinmarketcap.com/v1/cryptocurrency";

// in routes/portfolioRoutes.ts
export async function getAllAssets(req: Request, res: Response) {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { rows } = await pool.query(
      `
      SELECT id,
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
      ORDER BY rank ASC NULLS LAST
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching all assets:", err);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
}

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
      `SELECT 
         p.asset_id,
         p.quantity,
         p.invested_value,
         a.cmc_id,
         a.symbol,
         a.name,
         a.slug,
         a.rank,
         a.type,
         a.is_active,
         a.status,
         a.platform,
         a.logo_url
       FROM portfolio p
       JOIN assets a ON p.asset_id = a.id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (holdings.length === 0) {
      return res.json({
        totalValue: 0,
        totalInvested: 0,
        allTimeChange: 0,
        allTimeChangePercent: 0,
        portfolio24hChange: 0,
        portfolio24hChangePercent: 0,
        holdings: [],
      });
    }

    // fetch prices in batch
    const cmcIds = holdings.map((h) => h.cmc_id).join(",");
    const { data } = await axios.get(`${CMC_API}/quotes/latest`, {
      headers: { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY },
      params: { id: cmcIds },
    });

    let totalValue = 0;
    let totalInvested = 0;
    let portfolio24hChange = 0;

    const result = holdings.map((h) => {
      const quote = data.data[h.cmc_id].quote.USD;
      const price = quote.price;
      const value = price * Number(h.quantity);
      totalValue += value;
      totalInvested += Number(h.invested_value || 0);

      // ✅ 24h change
      const percent24h = quote.percent_change_24h;
      const priceYesterday = price / (1 + percent24h / 100);
      const valueYesterday = priceYesterday * Number(h.quantity);
      portfolio24hChange += value - valueYesterday;

      return {
        ...h, // spread all DB fields
        price,
        value,
        percent_change_24h: percent24h,
        profitLoss: value - Number(h.invested_value || 0),
        profitLossPercent: h.invested_value
          ? ((value - Number(h.invested_value)) / Number(h.invested_value)) *
            100
          : null,
      };
    });

    const allTimeChange = totalValue - totalInvested;
    const allTimeChangePercent =
      totalInvested > 0 ? (allTimeChange / totalInvested) * 100 : 0;

    const portfolio24hChangePercent =
      totalValue > 0
        ? (portfolio24hChange / (totalValue - portfolio24hChange)) * 100
        : 0;

    res.json({
      totalValue,
      totalInvested,
      allTimeChange,
      allTimeChangePercent,
      portfolio24hChange,
      portfolio24hChangePercent,
      holdings: result,
    });
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
      params: { limit: 50, sort: "market_cap", convert: "USD" },
    });

    // console.log(data);
    const trending = data.data.map((a) => ({
      symbol: a.symbol,
      name: a.name,
      market_pairs: a.num_market_pairs,
      date_added: a.date_added,
      tags: a.tags,
      max_supply: a.max_supply,
      circulating_supply: a.circulating_supply,
      total_supply: a.total_supply,
      platform: a.platform,
      cmc_rank: a.cmc_rank,
      self_reported_circulating_supply: a.self_reported_circulating_supply,
      self_reported_market_cap: a.self_reported_market_cap,
      price: a.quote.USD.price,
      percent_change_24h: a.quote.USD.percent_change_24h,
      market_cap: a.quote.USD.market_cap,
    }));
    // console.log(trending);

    res.json(trending);
  } catch (err) {
    console.error("Error fetching trending assets:", err);
    res.status(500).json({ error: "Failed to fetch trending assets" });
  }
}

// Function to fetch live price of a single asset
export async function getAssetPrice(req: Request, res: Response) {
  try {
    const { cmcId } = req.query;

    if (!cmcId || typeof cmcId !== "string") {
      return res
        .status(400)
        .json({ error: "cmcId is required and must be a string" });
    }

    const { data } = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
      {
        headers: { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY },
        params: { id: cmcId },
      }
    );

    const asset = data.data[cmcId];
    const price = asset.quote.USD.price;

    res.json({ cmcId, price });
  } catch (err) {
    console.error("Error fetching asset price:", err);
    res.status(500).json({ error: "Failed to fetch asset price" });
  }
}

// Function to get single asset detail
export async function getAssetDetail(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const { rows } = await pool.query(
      `
      SELECT p.quantity, p.invested_value,
             a.id, a.cmc_id, a.symbol, a.name, a.slug, a.type, a.logo_url, a.platform
      FROM portfolio p
      JOIN assets a ON p.asset_id = a.id
      WHERE p.user_id = $1 AND a.id = $2
      `,
      [userId, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Asset not found in portfolio" });
    }

    const asset = rows[0];

    // fetch latest price
    const { data } = await axios.get(`${CMC_API}/quotes/latest`, {
      headers: { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY },
      params: { id: asset.cmc_id },
    });

    const price = data.data[asset.cmc_id].quote.USD.price;
    const value = price * Number(asset.quantity);

    res.json({
      ...asset,
      price,
      value,
      profitLoss: value - asset.invested_value,
      profitLossPercent:
        ((value - asset.invested_value) / asset.invested_value) * 100,
    });
  } catch (err) {
    console.error("Error fetching asset detail:", err);
    res.status(500).json({ error: "Failed to fetch asset detail" });
  }
}

// Function to get portfolio history per time
// GET /api/v1/portfolio/history?range=7d

export async function getPortfolioHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { range } = req.query; // "24h" | "7d" | "30d" | "all"

    let query = `
      SELECT recorded_at, total_value
      FROM portfolio_history
      WHERE user_id = $1
    `;
    const values: any[] = [userId];

    if (range && range !== "all") {
      // map to days/hours
      const ranges: Record<string, string> = {
        "24h": "NOW() - INTERVAL '24 HOURS'",
        "7d": "NOW() - INTERVAL '7 DAYS'",
        "30d": "NOW() - INTERVAL '30 DAYS'",
      };

      if (ranges[range as string]) {
        query += ` AND recorded_at >= ${ranges[range as string]}`;
      }
    }

    query += " ORDER BY recorded_at ASC";

    const { rows } = await pool.query(query, values);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching portfolio history:", err);
    res.status(500).json({ error: "Failed to fetch portfolio history" });
  }
}
