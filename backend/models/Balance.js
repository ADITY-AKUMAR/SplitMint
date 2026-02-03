import mongoose from "mongoose";

const balanceSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    debtor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    debtorName: String,
    creditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creditorName: String,
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

// Compound index for efficient lookups
balanceSchema.index({ group: 1, debtor: 1, creditor: 1 }, { unique: true });

export default mongoose.model("Balance", balanceSchema);
