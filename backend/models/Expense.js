import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payerName: String,
    splitMode: {
      type: String,
      enum: ["equal", "custom", "percentage"],
      default: "equal",
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    notes: String,
  },
  { timestamps: true },
);

export default mongoose.model("Expense", expenseSchema);
