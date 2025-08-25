import axios from "axios";
import { getToken } from "./storage"; // adjust path if different

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Helper to attach auth headers
async function authHeaders() {
  const token = await getToken("token");
  if (!token) {
    throw new Error("No token found, user not authenticated");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// Function to get user profile
export async function getUserProfile() {
  const config = await authHeaders();
  const res = await axios.get(`${API_URL}/users/profile`, config);
  return res.data;
}

// Function to update user profile
export async function updateUserProfile(data: { name: string; email: string }) {
  const config = await authHeaders();
  const res = await axios.put(`${API_URL}/users/profile`, data, config);
  return res.data;
}

// Function to update user password
export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const config = await authHeaders();
  const res = await axios.put(`${API_URL}/users/password`, data, config);
  return res.data;
}
