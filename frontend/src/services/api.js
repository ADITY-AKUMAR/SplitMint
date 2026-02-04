import axios from "axios";

// Shared Axios instance for all API calls
const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach JWT token (if present) to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- AUTH ----------
export const authService = {
  register: (name, email, password) =>
    API.post("/auth/register", {
      name,
      email,
      password,
    }),

  login: (email, password) =>
    API.post("/auth/login", {
      email,
      password,
    }),
};

// ---------- GROUPS ----------
export const groupService = {
  create: (data) => API.post("/groups", data),
  getGroups: () => API.get("/groups"),
  getGroup: (id) => API.get(`/groups/${id}`),
  updateGroup: (id, name, description) =>
    API.put(`/groups/${id}`, { name, description }),
  deleteGroup: (id) => API.delete(`/groups/${id}`),
  addParticipant: (groupId, name, email, color) =>
    API.post(`/groups/${groupId}/participants`, { name, email, color }),
  addBalance: (groupId, from, to, amount, description) =>
    API.post("/balances", { groupId, from, to, amount, description }),
};

// ---------- EXPENSES ----------
export const expenseService = {
  add: (data) => API.post("/expenses", data),
  createExpense: (
    groupId,
    amount,
    description,
    date,
    participants,
    splitMode,
    notes,
  ) =>
    API.post("/expenses", {
      groupId,
      amount,
      description,
      date,
      participants,
      splitMode,
      notes,
    }),
  // Summary and balances for a group
  getBalances: (groupId) =>
    API.get(`/expenses/group/${groupId}/balances`),
  // Settlement suggestions for a group
  getSettlements: (groupId) =>
    API.get(`/expenses/group/${groupId}/settlements`),
};

// ---------- BALANCES ----------
export const balanceService = {
  get: (groupId) => API.get(`/expenses/group/${groupId}/balances`),
};

