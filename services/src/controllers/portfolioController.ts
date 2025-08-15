import { Request, Response } from "express";
import { pool } from "../lib/db";
import axios from "axios";

// Function to get the user's portfolio
export async function getPortfolio(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    // 1. Get user's assets from DB
    const { rows: assets } = await pool.query(
      `SELECT id, asset_name, asset_type, symbol, quantity, purchase_price
       FROM portfolio
       WHERE user_id = $1`,
      [userId]
    );

    if (assets.length === 0) {
      return res.json({ totalValue: 0, allocations: [], assets: [] });
    }

    // 2. Separate stocks & crypto
    const stocks = assets.filter((a) => a.asset_type === "stock");
    const cryptos = assets.filter((a) => a.asset_type === "crypto");

    // 3. Fetch current prices
    const stockPrices: Record<string, number> = {};
    if (stocks.length > 0) {
      const symbols = stocks.map((s) => s.symbol).join(",");
      const yahooRes = await axios.get(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`
      );
      yahooRes.data.quoteResponse.result.forEach((s: any) => {
        stockPrices[s.symbol] = s.regularMarketPrice;
      });
    }

    const cryptoPrices: Record<string, number> = {};
    if (cryptos.length > 0) {
      const ids = cryptos.map((c) => c.symbol).join(",");
      const cgRes = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
      );
      Object.keys(cgRes.data).forEach((key: any) => {
        cryptoPrices[key] = cgRes.data[key].usd;
      });
    }

    // 4. Build response with calculations
    let totalValue = 0;
    const enrichedAssets = assets.map((asset: any) => {
      const currentPrice =
        asset.asset_type === "stock"
          ? stockPrices[asset.symbol] || 0
          : cryptoPrices[asset.symbol] || 0;

      const currentValue = asset.quantity * currentPrice;
      const gainLoss = currentValue - asset.quantity * asset.purchase_price;
      const changePct =
        ((currentPrice - asset.purchase_price) / asset.purchase_price) * 100;

      totalValue += currentValue;

      return {
        ...asset,
        current_price: currentPrice,
        current_value: currentValue,
        gain_loss: gainLoss,
        change_pct: changePct,
      };
    });

    // 5. Asset allocation calculation
    const allocations = enrichedAssets.map((a: any) => ({
      name: a.asset_name,
      type: a.asset_type,
      value: a.current_value,
      percentage: ((a.current_value / totalValue) * 100).toFixed(2),
    }));

    res.json({
      totalValue,
      allocations,
      assets: enrichedAssets,
    });
  } catch (err) {
    console.error("getPortfolio error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to create a new portfolio asset
export async function createPortfolio(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    let { asset_name, asset_type, symbol, quantity, purchase_price } = req.body;

    if (!asset_name || !asset_type || !symbol) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch live market price
    let currentPrice: number;
    if (asset_type === "stock") {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
      );
      currentPrice = response.data.chart.result[0].meta.regularMarketPrice;
    } else if (asset_type === "crypto") {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
      );
      currentPrice = response.data[symbol].usd;
    } else {
      return res.status(400).json({ error: "Invalid asset_type" });
    }

    // Auto-calculate missing field
    if (!purchase_price && quantity) {
      purchase_price = currentPrice;
    } else if (!quantity && purchase_price) {
      quantity = (purchase_price / currentPrice).toFixed(8);
    } else if (!quantity && !purchase_price) {
      return res
        .status(400)
        .json({ error: "Provide quantity or purchase_price" });
    }

    const result = await pool.query(
      `INSERT INTO portfolio (user_id, asset_name, asset_type, symbol, quantity, purchase_price, current_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        asset_name,
        asset_type,
        symbol,
        Number(quantity),
        Number(purchase_price),
        Number(currentPrice),
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating portfolio:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to update an existing portfolio asset
export async function updatePortfolio(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Only allow updating certain fields
    const { asset_name, asset_type, symbol, quantity, purchase_price } =
      req.body;

    const { rows } = await pool.query(
      `UPDATE portfolio
       SET asset_name = COALESCE($1, asset_name),
           asset_type = COALESCE($2, asset_type),
           symbol = COALESCE($3, symbol),
           quantity = COALESCE($4, quantity),
           purchase_price = COALESCE($5, purchase_price)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [asset_name, asset_type, symbol, quantity, purchase_price, id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("updatePortfolio error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to delete a portfolio asset
export async function deletePortfolio(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const { rowCount } = await pool.query(
      `DELETE FROM portfolio WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({ message: "Asset deleted successfully" });
  } catch (err) {
    console.error("deletePortfolio error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
