import Balance from "../models/Balance.js";
import Group from "../models/Group.js";

// Create or update manual balance adjustment between two users
export const createBalanceAdjustment = async (req, res, next) => {
  try {
    const { groupId, from, to, amount, description } = req.body;

    if (!groupId || !from || !to || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check membership
    const isMember =
      group.owner.toString() === req.userId ||
      group.participants.some(
        (p) => p.userId && p.userId.toString() === req.userId,
      );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    const debtorId = from;
    const creditorId = to;
    const adjAmount = parseFloat(amount);

    // Try to find existing balance in same direction
    let balance = await Balance.findOne({
      group: groupId,
      debtor: debtorId,
      creditor: creditorId,
    });

    if (balance) {
      balance.amount = (balance.amount || 0) + adjAmount;
      await balance.save();
      return res.json({ message: "Balance updated", balance });
    }

    // Look for reverse direction
    const reverse = await Balance.findOne({
      group: groupId,
      debtor: creditorId,
      creditor: debtorId,
    });
    if (reverse) {
      if (reverse.amount > adjAmount) {
        reverse.amount = reverse.amount - adjAmount;
        await reverse.save();
        return res.json({ message: "Balance adjusted", balance: reverse });
      }

      // reverse.amount <= adjAmount
      const remaining = adjAmount - reverse.amount;
      await Balance.findByIdAndDelete(reverse._id);
      const debtorName =
        group.participants.find(
          (p) =>
            p.userId &&
            (p.userId._id || p.userId).toString() === debtorId.toString(),
        )?.name || "Unknown";
      const creditorName =
        group.participants.find(
          (p) =>
            p.userId &&
            (p.userId._id || p.userId).toString() === creditorId.toString(),
        )?.name || "Unknown";
      const newBalance = new Balance({
        group: groupId,
        debtor: debtorId,
        debtorName,
        creditor: creditorId,
        creditorName,
        amount: remaining,
      });
      await newBalance.save();
      return res.json({ message: "Balance updated", balance: newBalance });
    }

    // No existing balance, create new
    const debtorName =
      group.participants.find(
        (p) =>
          p.userId &&
          (p.userId._id || p.userId).toString() === debtorId.toString(),
      )?.name || "Unknown";
    const creditorName =
      group.participants.find(
        (p) =>
          p.userId &&
          (p.userId._id || p.userId).toString() === creditorId.toString(),
      )?.name || "Unknown";

    const newBalance = new Balance({
      group: groupId,
      debtor: debtorId,
      debtorName,
      creditor: creditorId,
      creditorName,
      amount: adjAmount,
    });

    await newBalance.save();
    res.status(201).json({ message: "Balance created", balance: newBalance });
  } catch (error) {
    next(error);
  }
};
