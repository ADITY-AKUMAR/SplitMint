import Group from "../models/Group.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import { calculateBalances } from "../utils/balanceEngine.js";
import Balance from "../models/Balance.js";

export const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = new Group({
      name,
      description,
      owner: req.userId,
      participants: [
        {
          userId: req.userId,
          name: req.userEmail.split("@")[0],
        },
      ],
    });

    await group.save();
    await group.populate("owner");
    await group.populate("participants.userId");

    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    next(error);
  }
};

export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({
      $or: [{ owner: req.userId }, { "participants.userId": req.userId }],
    })
      .populate("owner")
      .populate("participants.userId")
      .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (error) {
    next(error);
  }
};

export const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("owner")
      .populate("participants.userId");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is member
    const isMember =
      group.owner._id.toString() === req.userId ||
      group.participants.some((p) => p.userId._id.toString() === req.userId);

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get expenses
    const expenses = await Expense.find({ group: req.params.id }).sort({
      date: -1,
    });

    // Get balances
    const balances = await Balance.find({ group: req.params.id });

    res.json({ group, expenses, balances });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Only owner can update group" });
    }

    if (name) group.name = name;
    if (description) group.description = description;

    await group.save();
    await group.populate("owner");
    await group.populate("participants.userId");

    res.json({ message: "Group updated successfully", group });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Only owner can delete group" });
    }

    // Delete cascades to expenses and balances via pre-hook
    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const addParticipant = async (req, res, next) => {
  try {
    const { name, email, color } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only owner can add participants" });
    }

    if (group.participants.length >= 4) {
      return res
        .status(400)
        .json({ message: "Maximum 4 participants (including owner) allowed" });
    }

    let userId = null;
    if (email) {
      const user = await User.findOne({ email });
      userId = user ? user._id : null;
    }

    group.participants.push({
      userId,
      name: name || email?.split("@")[0] || "User",
      color: color || "#3B82F6",
    });

    await group.save();
    await group.populate("participants.userId");

    res.json({ message: "Participant added successfully", group });
  } catch (error) {
    next(error);
  }
};

export const removeParticipant = async (req, res, next) => {
  try {
    const { participantIndex } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only owner can remove participants" });
    }

    if (participantIndex === 0) {
      return res.status(400).json({ message: "Cannot remove owner" });
    }

    const removedParticipant = group.participants[participantIndex];
    const participantUserId = removedParticipant.userId;

    // Remove participant from group
    group.participants.splice(participantIndex, 1);
    await group.save();

    // Handle linked expenses:
    // Keep expense records for historical tracking, but update participants array
    if (participantUserId) {
      const Expense = require("../models/Expense.js").default;

      // Update expenses where this participant was in participants array
      await Expense.updateMany(
        {
          group: group._id,
          "participants.userId": participantUserId,
        },
        {
          $pull: {
            participants: { userId: participantUserId },
          },
        },
      );

      // Keep payer information intact for history, even if participant is removed
      // This preserves audit trail of who paid for what
    }

    await group.populate("participants.userId");

    res.json({
      message:
        "Participant removed successfully. Historical expenses preserved.",
      group,
    });
  } catch (error) {
    next(error);
  }
};

export const updateParticipant = async (req, res, next) => {
  try {
    const { participantIndex, name, color } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only owner can update participants" });
    }

    const participant = group.participants[participantIndex];
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    if (name) participant.name = name;
    if (color) participant.color = color;

    await group.save();
    await group.populate("participants.userId");

    res.json({ message: "Participant updated successfully", group });
  } catch (error) {
    next(error);
  }
};
