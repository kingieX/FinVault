import cron from "node-cron";
import { pool } from "./lib/db";
import {
  checkGoalDeadlines,
  checkBudgetOverspending,
} from "./services/notificationScheduler";
import { generateSpendingInsights } from "./services/insightService";

// Runs every day at 9:00 AM server time
cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Running daily notification checks...");

  try {
    await checkGoalDeadlines();
    await checkBudgetOverspending();
    console.log("✅ Notification checks completed");
  } catch (err) {
    console.error("❌ Error running notification checks:", err);
  }
});

// Weekly insights (Mon 09:00)
cron.schedule("0 9 * * MON", async () => {
  console.log("📊 Weekly insights job started...");
  const { rows: users } = await pool.query(`SELECT id FROM users`);
  for (const u of users) {
    await generateSpendingInsights(u.id);
  }
  console.log("✅ Weekly insights job done");
});

// For testing: run every minute
// cron.schedule("* * * * *", async () => {
//   console.log("⏰ Running notification checks (every minute for testing)...");
//   await checkGoalDeadlines();
//   await checkBudgetOverspending();
// });

// DEV ONLY: every minute
// if (process.env.NODE_ENV !== "production") {
//   cron.schedule("*/1 * * * *", async () => {
//     console.log("🧪 DEV – generating insights every minute...");
//     const { rows: users } = await pool.query(`SELECT id FROM users LIMIT 3`);
//     for (const u of users) {
//       await generateSpendingInsights(u.id);
//     }
//   });
// }
