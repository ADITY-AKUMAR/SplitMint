import express from "express";
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getBalances,
  getSettlementSuggestions,
} from "../controllers/expenseController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/:id", getExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

router.get("/group/:groupId/balances", getBalances);
router.get("/group/:groupId/settlements", getSettlementSuggestions);

export default router;
