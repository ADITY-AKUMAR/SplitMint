import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authService = {
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),
  login: (email, password) => api.post("/auth/login", { email, password }),
  getMe: () => api.get("/auth/me"),
};

export const groupService = {
  createGroup: (name, description) =>
    api.post("/groups", { name, description }),
  getGroups: () => api.get("/groups"),
  getGroup: (id) => api.get(`/groups/${id}`),
  updateGroup: (id, name, description) =>
    api.put(`/groups/${id}`, { name, description }),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
  addParticipant: (id, name, email, color) =>
    api.post(`/groups/${id}/participants`, { name, email, color }),
  removeParticipant: (id, participantIndex) =>
    api.delete(`/groups/${id}/participants`, { data: { participantIndex } }),
  updateParticipant: (id, participantIndex, name, color) =>
    api.put(`/groups/${id}/participants`, { participantIndex, name, color }),
  addBalance: (groupId, from, to, amount, description) =>
    api.post(`/balances`, { groupId, from, to, amount, description }),
};

export const expenseService = {
  createExpense: (
    groupId,
    amount,
    description,
    date,
    participants,
    splitMode,
    notes,
  ) =>
    api.post("/expenses", {
      groupId,
      amount,
      description,
      date,
      participants,
      splitMode,
      notes,
    }),
  getExpenses: (filters) => api.get("/expenses", { params: filters }),
  getExpense: (id) => api.get(`/expenses/${id}`),
  updateExpense: (
    id,
    amount,
    description,
    date,
    participants,
    splitMode,
    notes,
  ) =>
    api.put(`/expenses/${id}`, {
      amount,
      description,
      date,
      participants,
      splitMode,
      notes,
    }),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getBalances: (groupId) => api.get(`/expenses/group/${groupId}/balances`),
  getSettlements: (groupId) =>
    api.get(`/expenses/group/${groupId}/settlements`),
};

export default api;
