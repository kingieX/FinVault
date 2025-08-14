import { pool } from "../lib/db";
import { getGeminiModel, hasGemini } from "../lib/ai";
import { sendPushToUser } from "./pushService";

// Define the structure of a transaction
type Txn = {
  id: string;
  description: string | null;
  category: string | null;
  amount: number; // negative = spend, positive = income (if that’s your convention)
  date: Date;
};

// Format amounts in Naira
function naira(n: number) {
  return `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

// Function to fetch last 30 days transactions for a user
async function fetchLast30DaysTransactions(userId: string): Promise<Txn[]> {
  const { rows } = await pool.query(
    `
    SELECT id, description, category, amount,
           COALESCE(date, created_at) AS date
    FROM transactions
    WHERE user_id = $1
      AND COALESCE(date, created_at) >= NOW() - INTERVAL '30 days'
    ORDER BY COALESCE(date, created_at) DESC
    `,
    [userId]
  );
  return rows.map((r: any) => ({
    id: r.id,
    description: r.description,
    category: r.category,
    amount: Number(r.amount),
    date: new Date(r.date),
  }));
}

// Function to aggregate transactions
function aggregate(transactions: Txn[]) {
  const byCategory: Record<string, number> = {};
  const byMerchant: Record<string, number> = {};
  let totalSpending = 0;

  for (const t of transactions) {
    // assume negative amounts are spending
    const spend = t.amount < 0 ? Math.abs(t.amount) : 0;
    totalSpending += spend;

    const cat = (t.category || "Uncategorized").toLowerCase();
    byCategory[cat] = (byCategory[cat] || 0) + spend;

    const merch = (t.description || "Unknown").toLowerCase();
    byMerchant[merch] = (byMerchant[merch] || 0) + spend;
  }

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topMerchants = Object.entries(byMerchant)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return { totalSpending, byCategory, topCategory, topMerchants };
}

// Function to generate rule-based insights
function ruleBasedInsights(agg: ReturnType<typeof aggregate>): string[] {
  const insights: string[] = [];
  const { totalSpending, topCategory } = agg;

  if (topCategory) {
    const [name, amount] = topCategory;
    insights.push(
      `You spent the most on ${name} this month: ${naira(
        amount
      )}. Consider setting a tighter limit next month.`
    );
  }

  if (totalSpending > 0) {
    insights.push(
      `Your total spending in the last 30 days is ${naira(
        totalSpending
      )}. Try a weekly check-in to keep it under control.`
    );
  }

  return insights;
}

// Function to generate insights using Gemini AI
async function geminiInsights(
  transactions: Txn[],
  agg: ReturnType<typeof aggregate>
): Promise<string[]> {
  const model = getGeminiModel("gemini-2.0-flash");

  // keep prompt compact: send only aggregates + a tiny sample of recent txns
  const recentSample = transactions.slice(0, 15).map((t) => ({
    date: t.date.toISOString().split("T")[0],
    category: t.category,
    desc: t.description,
    amount: t.amount,
  }));

  const prompt = `
You are a concise financial coach for a Nigerian user. Currency is Naira (₦).
Given the user's last 30 days spending aggregates and a small sample of transactions,
produce 1–3 SHORT, actionable insights (max 200 chars each), neutral tone, no emojis.
Avoid generic advice. Focus on categories or habits you see.

AGGREGATE (amounts are positive numbers for spend):
${JSON.stringify(agg, null, 2)}

SAMPLE_TXNS:
${JSON.stringify(recentSample, null, 2)}

Return JSON like:
{ "insights": ["...", "..."] }
`;

  const resp = await model.generateContent(prompt);
  const text = resp.response.text();

  try {
    const json = JSON.parse(text);
    const arr = Array.isArray(json.insights) ? json.insights : [];
    // sanitize + trim
    return arr
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    // If Gemini returns non-JSON text, fall back to rule-based
    return ruleBasedInsights(agg);
  }
}

// Function to create a notification for insights
async function createInsightNotification(userId: string, message: string) {
  // de-dupe: do not repeat the same message within 7 days
  const { rows: dup } = await pool.query(
    `
    SELECT 1 FROM notifications
    WHERE user_id = $1
      AND type = 'insight'
      AND message = $2
      AND created_at >= NOW() - INTERVAL '7 days'
    LIMIT 1
    `,
    [userId, message]
  );
  if (dup.length > 0) return null;

  const { rows } = await pool.query(
    `
    INSERT INTO notifications (user_id, title, message, type)
    VALUES ($1, $2, $3, 'insight')
    RETURNING id
    `,
    [userId, "Spending Insight", message]
  );
  return rows[0].id as string;
}

/**
 * Main entrypoint: generate + store + (optionally) push.
 */
export async function generateSpendingInsights(userId: string) {
  const txns = await fetchLast30DaysTransactions(userId);
  if (txns.length === 0) return { created: 0 };

  const agg = aggregate(txns);
  const ideas = hasGemini
    ? await geminiInsights(txns, agg)
    : ruleBasedInsights(agg);

  let createdIds: string[] = [];
  for (const idea of ideas) {
    const id = await createInsightNotification(userId, idea);
    if (id) createdIds.push(id);
  }

  // Push just the first new one (avoid spamming)
  if (createdIds.length > 0) {
    await sendPushToUser(userId, {
      title: "Spending Insight",
      body: ideas[0],
      data: { screen: "home" },
    });
    await pool.query(
      `UPDATE notifications SET sent_push_at = NOW() WHERE id = $1`,
      [createdIds[0]]
    );
  }

  return { created: createdIds.length };
}
