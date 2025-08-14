import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionsRoutes from "./routes/transactionsRoutes";
import accountsRoutes from "./routes/accountsRoutes";
import budgetsRoutes from "./routes/budgetsRoutes";
import goalsRoutes from "./routes/goalsRoutes";
import notificationsRoutes from "./routes/notificationsRoutes";
import insightsRoutes from "./routes/insightsRoutes";

import { pool } from "./lib/db";

// Schedule the notification checks to run daily at midnight
import "./scheduler";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Check for the health of the API
app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
  });
});

// Make a simple API endpoint
app.get("/api/v1/hello", (_req, res) => {
  res.json({ message: "Hello from FinVault API (dev)" });
});

// endpoint for authentication
app.use("/api/v1/auth", authRoutes);

// endpoint to get current user
app.use("/api/v1/users", userRoutes);

// endpoint to get transactions
app.use("/api/v1/transactions", transactionsRoutes);

// endpoint to get accounts
app.use("/api/v1/accounts", accountsRoutes);

// endpoint to get budgets
app.use("/api/v1/budgets", budgetsRoutes);

// endpoint to get goals
app.use("/api/v1/goals", goalsRoutes);

// endpoint to get notifications
app.use("/api/v1/notifications", notificationsRoutes);

// endpoint to get insights
app.use("/api/v1/insights", insightsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`FinVault API server listening on http://localhost:${PORT}`);

  // Test DB connection
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database connected:", result.rows[0].now);
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
});
