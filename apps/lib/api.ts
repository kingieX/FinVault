import axios from "axios";
import { saveToken, getToken } from "@/lib/storage";
// import * as SecureStore from "expo-secure-store";
// to get IPv4 address, run `ipconfig` on Windows or `ifconfig` on Mac/Linux
// and look for the address under your active network connection (e.g., Wi-Fi or Ethernet)

// const API_URL = "http://localhost:5000/api/v1";
const API_URL = "http://172.20.10.3:5000/api/v1";

// ##--authentication functions--

// Function for signing up a new user
export async function signup(email: string, password: string, name: string) {
  //   console.log({ email, password, name });
  const res = await axios.post(`${API_URL}/auth/signup`, {
    email,
    password,
    name,
  });
  await saveToken("token", res.data.token);
  //   await SecureStore.setItemAsync("token", res.data.token);
  return res.data.user;
}

// Function for logging in an existing user
export async function login(email: string, password: string) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  await saveToken("token", res.data.token);
  //   await SecureStore.setItemAsync("token", res.data.token);
  return res.data.user;
}

// Function to get the current authenticated user
export async function getCurrentUser() {
  //   const token = await SecureStore.getItemAsync("token");
  const token = await getToken("token");
  //   console.log("Current token:", token);
  if (!token) {
    console.log("No token found, user not authenticated");
    return null;
  }

  try {
    const res = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    return null;
  }
}

// ##--account functions--

// Function to get all accounts with their recent transactions
export async function getAccounts() {
  const token = await getToken("token");
  if (!token) throw new Error("No token found");

  const res = await axios.get(`${API_URL}/accounts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// Function to link account
export async function linkAccount(code: string) {
  const token = await getToken("token");
  const res = await fetch(`${API_URL}/accounts/link-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });
  return res.json();
}

// ##--transaction functions--

// Function to get all transactions for the authenticated user
export async function getTransactions() {
  const token = await getToken("token");
  if (!token) throw new Error("No token found");

  const res = await axios.get(`${API_URL}/transactions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// ##--budget functions--

// Function to get budgets
export async function getBudgets() {
  const token = await getToken("token");
  if (!token) return [];

  const res = await axios.get(`${API_URL}/budgets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Function to Create a new budget
export async function createBudget(data: {
  category: string;
  limit_amount: number;
  spent_amount?: number;
  month: number;
  year: number;
  icon?: string;
  color?: string;
  description?: string;
  tags?: string;
}) {
  const token = await getToken("token");
  if (!token) return null;

  const res = await axios.post(`${API_URL}/budgets`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

// ##--goal functions--

// Function to Get goals
export async function getGoals() {
  const token = await getToken("token");
  if (!token) return [];

  const res = await axios.get(`${API_URL}/goals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Function to Create a new goal
export async function createGoal(data: {
  name: string;
  target_amount: number;
  saved_amount?: number;
  deadline?: string;
  category?: string;
  icon?: string;
}) {
  const token = await getToken("token");
  if (!token) return null;

  const res = await axios.post(`${API_URL}/goals`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ##--notification functions--

// Function to Get notifications
export async function getNotifications() {
  const token = await getToken("token");
  if (!token) return [];

  const res = await axios.get(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Function to mark a notification as read
export async function markNotificationAsRead(id: string) {
  const token = await getToken("token");
  if (!token) return null;
  const res = await axios.patch(
    `${API_URL}/notifications/${id}/read`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

// Function to get unread notifications count
export async function getUnreadNotificationsCount() {
  const token = await getToken("token");
  if (!token) return 0;
  const res = await axios.get(`${API_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.count;
}

// ##--insights functions--

// Function to get insights
export async function getInsights(limit = 3) {
  const token = await getToken("token");
  if (!token) return [];
  const res = await axios.get(`${API_URL}/insights?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ##--portfolio functions--

let cachedCryptoList: any[] = [];
let cachedStockList: any[] = [];

/** Fetch crypto list (cached) */
export async function fetchCryptoList() {
  if (cachedCryptoList.length > 0) return cachedCryptoList;
  const res = await axios.get("https://api.coingecko.com/api/v3/coins/list");
  cachedCryptoList = res.data;
  return cachedCryptoList;
}

/** Fetch stock list (cached, static JSON for now) */
export async function fetchStockList() {
  if (cachedStockList.length > 0) return cachedStockList;

  // Example static stock list - replace with your JSON or API call
  cachedStockList = [
    { name: "Apple Inc.", symbol: "AAPL" },
    { name: "Microsoft Corp.", symbol: "MSFT" },
    { name: "Tesla Inc.", symbol: "TSLA" },
    { name: "Amazon.com Inc.", symbol: "AMZN" },
    { name: "Alphabet Inc.", symbol: "GOOGL" },
  ];
  return cachedStockList;
}

/** Fetch current price based on type + symbol */
export async function getAssetPrice(type: "stock" | "crypto", symbol: string) {
  if (type === "crypto") {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
    );
    return res.data[symbol]?.usd || null;
  } else {
    const res = await axios.get(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
    );
    return res.data.quoteResponse.result[0]?.regularMarketPrice || null;
  }
}

// Function to get portfolio
export async function getPortfolio() {
  const token = await getToken("token");
  if (!token) return null;

  const res = await axios.get(`${API_URL}/portfolio`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Function to create a new portfolio asset
export async function createPortfolio(data: {
  asset_name: string;
  asset_type: "stock" | "crypto";
  symbol: string;
  quantity: number;
  purchase_price: number;
}) {
  const token = await getToken("token");
  if (!token) return null;

  const res = await axios.post(`${API_URL}/portfolio`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
// Function to edit Portfolio Asset
export async function updatePortfolio(
  id: string,
  data: Partial<{
    asset_name: string;
    asset_type: "stock" | "crypto";
    symbol: string;
    quantity: number;
    purchase_price: number;
  }>
) {
  const token = await getToken("token");
  if (!token) return null;

  const res = await axios.put(`${API_URL}/portfolio/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Function to delete Portfolio Asset
export async function deletePortfolio(id: string) {
  const token = await getToken("token");
  if (!token) return null;

  const res = await axios.delete(`${API_URL}/portfolio/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
