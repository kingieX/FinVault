import axios from "axios";
import { saveToken, getToken } from "@/lib/storage";
// import * as SecureStore from "expo-secure-store";
// to get IPv4 address, run `ipconfig` on Windows or `ifconfig` on Mac/Linux
// and look for the address under your active network connection (e.g., Wi-Fi or Ethernet)

// const API_URL = "http://localhost:5000/api/v1";
const API_URL = "http://172.20.10.3:5000/api/v1";
// const API_URL = "https://finvault-service.onrender.com/api/v1"; // Use this for production

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

// Function to get user profile
export async function getUserProfile() {
  const token = await getToken("token");
  if (!token) {
    throw new Error("No token found, user not authenticated");
  }

  const res = await axios.get(`${API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// Function to update user profile
export async function updateUserProfile(data: { name: string; email: string }) {
  const token = await getToken("token");
  if (!token) {
    throw new Error("No token found, user not authenticated");
  }

  const res = await axios.put(`${API_URL}/users/profile`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// Function to update user password
export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const token = await getToken("token");
  if (!token) {
    throw new Error("No token found, user not authenticated");
  }
  const res = await axios.put(`${API_URL}/users/password`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// Function to logout user
export async function logoutUser() {
  const token = await getToken("token");
  if (!token) {
    throw new Error("No token found, user not authenticated");
  }
  const res = await axios.post(
    `${API_URL}/users/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

// Function to Delete Account
export async function deleteAccount() {
  const token = await getToken("token");
  if (!token) {
    throw new Error("No token found, user not authenticated");
  }
  const res = await axios.delete(`${API_URL}/users/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// Function to get Mono customer ID
export async function getMonoCustomer() {
  const token = await getToken("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await axios.get(`${API_URL}/users/mono-customer`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.customerId;
  } catch (err) {
    console.error("Failed to fetch Mono customer ID:", err);
    throw err;
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

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to link account");
  }

  return data;
}

// Function to unlink account
export async function unlinkAccount(accountId: string) {
  const token = await getToken("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_URL}/accounts/unlink-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ accountId }),
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

// Function to get a single budget by ID
export async function getBudgetById(id: string) {
  const token = await getToken("token");
  if (!token) throw new Error("User is not authenticated.");

  const res = await axios.get(`${API_URL}/budgets/${id}`, {
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

// Function to update an existing budget
export async function updateBudget(
  id: string,
  data: {
    category?: string;
    limit_amount?: number;
    spent_amount?: number;
    month?: number;
    year?: number;
    icon?: string;
    color?: string;
    description?: string;
    tags?: string;
  }
) {
  const token = await getToken("token");
  if (!token) throw new Error("User is not authenticated.");

  const res = await axios.put(`${API_URL}/budgets/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Function to delete an existing budget
export async function deleteBudget(id: string) {
  const token = await getToken("token");
  if (!token) throw new Error("User is not authenticated.");

  const res = await axios.delete(`${API_URL}/budgets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Function to update spending
export async function updateSpentAmount(budgetId: string, amount: number) {
  const token = await getToken("token");
  if (!token) throw new Error("User is not authenticated.");

  const res = await axios.patch(
    `${API_URL}/budgets/${budgetId}/spent`,
    { amount },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
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

// FUnction to get a single goal
export async function getGoalById(id: string) {
  const token = await getToken("token");
  if (!token) return [];

  const res = await axios.get(`${API_URL}/goals/${id}`, {
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

// Function to update an existing goal
export async function updateGoal(
  id: string,
  data: {
    name?: string;
    target_amount?: number;
    saved_amount?: number;
    deadline?: string;
    category?: string;
    icon?: string;
  }
) {
  const token = await getToken("token");
  if (!token) {
    throw new Error("User is not authenticated.");
  }

  const res = await axios.put(`${API_URL}/goals/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// function to specifically top up a goal's amount (PATCH)
export async function topUpGoal(goalId: string, amount: number) {
  const token = await getToken("token");
  if (!token) {
    throw new Error("User is not authenticated.");
  }

  // The new endpoint will handle the saved_amount calculation on the backend
  const res = await axios.patch(
    `${API_URL}/goals/${goalId}/top-up`,
    { amount },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

// Function to delete a goal
export async function deleteGoal(id: string) {
  const token = await getToken("token");
  if (!token) {
    throw new Error("User is not authenticated.");
  }

  const res = await axios.delete(`${API_URL}/goals/${id}`, {
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

// Function to get single notification
export async function getNotificationById(id: string) {
  const token = await getToken("token");
  if (!token) throw new Error("User is not authenticated.");

  const res = await axios.get(`${API_URL}/notifications/${id}`, {
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

// Function to get all assets from DB
export async function getAllPortfolioAssets(limit = 50, offset = 0) {
  const res = await axios.get(`${API_URL}/portfolio/all-assets`, {
    params: { limit, offset },
  });
  return res.data;
}

// Function to search for asset
export async function searchPortfolioAssets(search: string) {
  try {
    const res = await axios.get(`${API_URL}/portfolio/assets`, {
      params: { search },
    });
    return res.data; // [{ id, cmc_id, rank, symbol, name, ... }]
  } catch (err) {
    console.error("Failed to search assets:", err);
    throw err;
  }
}

// ➕ Add asset to portfolio (auth required)
export async function addPortfolioAsset({
  symbol,
  type,
  quantity,
  amount,
}: {
  symbol: string;
  type: "crypto" | "stock"; // extendable
  quantity?: number;
  amount?: number;
}) {
  const token = await getToken("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await axios.post(
      `${API_URL}/portfolio/add`,
      { symbol, type, quantity, amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; // { success, symbol, quantity, investedValue }
  } catch (err) {
    console.error("Failed to add portfolio asset:", err);
    throw err;
  }
}

// 📊 Get user portfolio (auth required)
export async function getPortfolio() {
  const token = await getToken("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await axios.get(`${API_URL}/portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { totalValue, holdings: [...] }
  } catch (err) {
    console.error("Failed to fetch portfolio:", err);
    throw err;
  }
}

// 🚀 Get trending assets (no auth needed)
export async function getTrendingAssets() {
  try {
    const res = await axios.get(`${API_URL}/portfolio/trending`);
    return res.data; // [ { symbol, name, price, percent_change_24h, ... } ]
  } catch (err) {
    console.error("Failed to fetch trending assets:", err);
    throw err;
  }
}

// Function to get asset price
export async function getAssetPrice(cmcId: number) {
  const token = await getToken("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await axios.get(`${API_URL}/portfolio/price`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { cmcId },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch asset price:", err);
    throw err;
  }
}

// Function to get single asset detail
export async function getAssetDetail(assetId: string) {
  const token = await getToken("token");
  if (!token) throw new Error("No token found");

  const res = await axios.get(`${API_URL}/portfolio/asset/${assetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Function to get portfolio history per time
export async function getPortfolioHistory(range: "24h" | "7d" | "30d" | "all") {
  const token = await getToken("token");
  if (!token) throw new Error("No token found");

  try {
    const res = await axios.get(`${API_URL}/portfolio/history?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch portfolio history:", err);
    throw err;
  }
}
