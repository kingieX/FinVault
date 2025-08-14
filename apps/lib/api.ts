import axios from "axios";
import { saveToken, getToken } from "@/lib/storage";
// import * as SecureStore from "expo-secure-store";
// to get IPv4 address, run `ipconfig` on Windows or `ifconfig` on Mac/Linux
// and look for the address under your active network connection (e.g., Wi-Fi or Ethernet)

// const API_URL = "http://localhost:5000/api/v1";
const API_URL = "http://172.20.10.3:5000/api/v1";

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

// Function to get insights
export async function getInsights(limit = 3) {
  const token = await getToken("token");
  if (!token) return [];
  const res = await axios.get(`${API_URL}/insights?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
