import express from "express";
import { createBalanceAdjustment } from "../controllers/balanceController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createBalanceAdjustment);

export default router;
