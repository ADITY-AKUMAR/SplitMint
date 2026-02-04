import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";
import { errorHandler } from "./middleware/auth.js";

const app = express();

/* =======================
   MIDDLEWARES (FIXED)
======================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://splitmintbackend.onrender.com",
    ],
    credentials: true,
  })
);

// 🔥 VERY IMPORTANT (BOTH REQUIRED)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   API ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/balances", balanceRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

/* =======================
   FRONTEND SERVE
======================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.use(errorHandler);

export default app;
