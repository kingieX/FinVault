import { pool } from "../lib/db";
import { sendPushToUser } from "./pushService";

// function to check for goal deadlines and create notifications
export async function checkGoalDeadlines() {
  try {
    const result = await pool.query(
      `SELECT g.*, u.id as user_id
       FROM goals g
       JOIN users u ON u.id = g.user_id
       WHERE g.deadline IS NOT NULL
       AND g.deadline::date <= (CURRENT_DATE + INTERVAL '7 days')
       AND g.deadline::date >= CURRENT_DATE
       AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = g.user_id
             AND n.type = 'goal_deadline'
             AND n.created_at::date = CURRENT_DATE
             AND n.message LIKE '%' || g.name || '%'
         )`
    );

    for (const goal of result.rows) {
      const { rows } = await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'goal_deadline')
         RETURNING id`,
        [
          goal.user_id,
          "Goal Deadline Approaching",
          `Your goal "${goal.name}" is due on ${
            goal.deadline.toISOString().split("T")[0]
          }.`,
        ]
      );

      console.log(
        `✅ Goal deadline notifications created: ${result.rows.length}`
      );

      await sendPushToUser(goal.user_id, {
        title: "Goal Deadline Approaching",
        body: `Your goal "${goal.name}" is due on ${
          goal.deadline.toISOString().split("T")[0]
        }.`,
        data: { screen: "goals", goalId: goal.id },
      });

      await pool.query(
        `UPDATE notifications SET sent_push_at = NOW() WHERE id = $1`,
        [rows[0].id]
      );
    }
  } catch (err) {
    console.error("Error checking goal deadlines:", err);
  }
}

// function to check for budget overspending and create notifications
export async function checkBudgetOverspending() {
  try {
    const result = await pool.query(
      `SELECT b.*, u.id as user_id
       FROM budgets b
       JOIN users u ON u.id = b.user_id
       WHERE b.spent_amount >= b.limit_amount
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.user_id = b.user_id
           AND n.type = 'budget_overspend'
           AND n.created_at::date = CURRENT_DATE
           AND n.message LIKE '%' || b.category || '%'
       )`
    );

    for (const b of result.rows) {
      const { rows } = await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'budget_overspend')
       RETURNING id`,
        [
          b.user_id,
          "Budget Limit Reached",
          `You reached your "${b.category}" budget.`,
        ]
      );

      console.log(
        `✅ Budget overspending notifications created: ${result.rows.length}`
      );

      await sendPushToUser(b.user_id, {
        title: "Budget Limit Reached",
        body: `You reached your "${b.category}" budget.`,
        data: { screen: "budgets", category: b.category },
      });

      await pool.query(
        `UPDATE notifications SET sent_push_at = NOW() WHERE id = $1`,
        [rows[0].id]
      );
    }

    // for (const budget of result.rows) {
    //   await pool.query(
    //     `INSERT INTO notifications (user_id, title, message, type)
    //      VALUES ($1, $2, $3, $4)`,
    //     [
    //       budget.user_id,
    //       "Budget Limit Reached",
    //       `You have reached your budget limit for "${budget.category}".`,
    //       "budget_overspend",
    //     ]
    //   );
    // }
    // console.log(
    //   `✅ Budget overspending notifications created: ${result.rows.length}`
    // );
  } catch (err) {
    console.error("Error checking budget overspending:", err);
  }
}
