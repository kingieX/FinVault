import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { pool } from "../lib/db";

const expo = new Expo();

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; data?: Record<string, any> }
) {
  // fetch all device tokens for user
  const r = await pool.query(
    `SELECT expo_push_token FROM user_device_tokens WHERE user_id = $1`,
    [userId]
  );
  const tokens: string[] = r.rows.map((x) => x.expo_push_token).filter(Boolean);

  if (tokens.length === 0) return;

  const messages: ExpoPushMessage[] = tokens
    .filter((t) => Expo.isExpoPushToken(t))
    .map((token) => ({
      to: token,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      priority: "high",
    }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];
  for (const chunk of chunks) {
    const res = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...res);
  }
  return tickets;
}
