import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import Balance from "../models/Balance.js";
import { calculateBalances, normalizeSplit } from "../utils/balanceEngine.js";

export const createExpense = async (req, res, next) => {
  try {
    const {
      groupId,
      amount,
      description,
      date,
      participants,
      splitMode,
      notes,
    } = req.body;

    if (
      !groupId ||
      !amount ||
      !description ||
      !participants ||
      participants.length === 0
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is member
    const isMember =
      (group.owner && group.owner.toString() === req.userId) ||
      group.participants.some((p) =>
        p.userId ? p.userId.toString() === req.userId : false,
      );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate and normalize split
    const normalizedParticipants = normalizeSplit(
      participants.map((p) => ({
        ...p,
        percentage: p.percentage || 0,
      })),
      amount,
      splitMode || "equal",
    );

    // Get payer details
    const payerParticipant = group.participants.find((p) =>
      p.userId ? p.userId.toString() === req.userId : false,
    );

    const expense = new Expense({
      group: groupId,
      amount,
      description,
      date: date || new Date(),
      payer: req.userId,
      payerName: payerParticipant?.name || "Unknown",
      splitMode: splitMode || "equal",
      participants: normalizedParticipants,
      notes,
    });

    await expense.save();

    // Recalculate balances
    const expenses = await Expense.find({ group: groupId }).populate("payer");
    await calculateBalances(expenses, groupId, Balance);

    // Update group total spent
    const total = await Expense.aggregate([
      { $match: { group: group._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    group.totalSpent = total[0]?.total || 0;
    await group.save();

    res.status(201).json({
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req, res, next) => {
  try {
    const {
      groupId,
      participant,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
    } = req.query;

    const query = {};
    if (groupId) query.group = groupId;
    if (participant) query["participants.userId"] = participant;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const expenses = await Expense.find(query)
      .populate("payer")
      .populate("participants.userId")
      .sort({ date: -1 });

    res.json({ expenses });
  } catch (error) {
    next(error);
  }
};

export const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("payer")
      .populate("participants.userId");

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const group = await Group.findById(expense.group);
    const isMember =
      (group.owner && group.owner.toString() === req.userId) ||
      group.participants.some((p) =>
        p.userId ? p.userId.toString() === req.userId : false,
      );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const { amount, description, date, participants, splitMode, notes } =
      req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const group = await Group.findById(expense.group);
    if (
      group.owner.toString() !== req.userId &&
      expense.payer.toString() !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: "Only owner or payer can update expense" });
    }

    if (amount) expense.amount = amount;
    if (description) expense.description = description;
    if (date) expense.date = date;
    if (splitMode) expense.splitMode = splitMode;
    if (notes) expense.notes = notes;

    if (participants) {
      const normalizedParticipants = normalizeSplit(
        participants.map((p) => ({ ...p, percentage: p.percentage || 0 })),
        amount || expense.amount,
        splitMode || expense.splitMode,
      );
      expense.participants = normalizedParticipants;
    }

    await expense.save();

    // Recalculate balances
    const expenses = await Expense.find({ group: expense.group }).populate(
      "payer",
    );
    await calculateBalances(expenses, expense.group, Balance);

    res.json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const group = await Group.findById(expense.group);
    if (
      group.owner.toString() !== req.userId &&
      expense.payer.toString() !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: "Only owner or payer can delete expense" });
    }

    const groupId = expense.group;
    await Expense.findByIdAndDelete(req.params.id);

    // Recalculate balances
    const expenses = await Expense.find({ group: groupId }).populate("payer");
    await calculateBalances(expenses, groupId, Balance);

    // Update group total spent
    const total = await Expense.aggregate([
      { $match: { group: group._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    group.totalSpent = total[0]?.total || 0;
    await group.save();

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const balances = await Balance.find({ group: groupId })
      .populate("debtor")
      .populate("creditor")
      .sort({ amount: -1 });

    // Calculate summary for current user
    const summary = {
      totalOwed: 0,
      totalOwes: 0,
      balances: [],
    };

    for (const balance of balances) {
      if (balance.debtor._id.toString() === req.userId) {
        summary.totalOwes += balance.amount;
      }
      if (balance.creditor._id.toString() === req.userId) {
        summary.totalOwed += balance.amount;
      }

      summary.balances.push({
        debtor: balance.debtorName,
        creditor: balance.creditorName,
        amount: balance.amount,
      });
    }

    res.json({ ...summary, allBalances: balances });
  } catch (error) {
    next(error);
  }
};

export const getSettlementSuggestions = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // Get all balances for the group
    const balances = await Balance.find({ group: groupId })
      .populate("debtor")
      .populate("creditor");

    if (!balances || balances.length === 0) {
      return res.json({
        message: "Group is settled - no outstanding balances",
        settlements: [],
      });
    }

    // Import computeSettlements from balance engine
    const { computeSettlements } = await import("../utils/balanceEngine.js");
    const settlements = computeSettlements(balances);

    res.json({
      message: "Settlement suggestions computed",
      settlements,
      totalOutstanding: balances.reduce((sum, b) => sum + b.amount, 0),
    });
  } catch (error) {
    next(error);
  }
};
