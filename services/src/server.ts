import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
  });
});

app.get("/api/v1/hello", (_req, res) => {
  res.json({ message: "Hello from FinVault API (dev)" });
});

// Placeholder for Plaid token exchange (mock)
app.post("/api/v1/plaid/exchange", (_req, res) => {
  res.json({
    message:
      "This is a placeholder for Plaid token exchange. Implement server-side Plaid logic here.",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FinVault API server listening on http://localhost:${PORT}`);
});
