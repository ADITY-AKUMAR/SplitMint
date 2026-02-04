// frontend/src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  withCredentials: true, // 🔥 MOST IMPORTANT LINE
});

// ---------- AUTH ----------
export const authService = {
  register: (name, email, password) =>
    API.post("/auth/register", { name, email, password }),

  login: (email, password) =>
    API.post("/auth/login", { email, password }),
};

// ---------- GROUPS ----------
export const groupService = {
  create: (data) => API.post("/groups", data),
  getAll: () => API.get("/groups"),
};

// ---------- EXPENSES ----------
export const expenseService = {
  add: (data) => API.post("/expenses", data),
};

// ---------- BALANCES ----------
export const balanceService = {
  get: (groupId) => API.get(`/balances/${groupId}`),
};
