import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          default: "#3B82F6",
        },
        avatar: String,
      },
    ],
    totalSpent: {
      type: Number,
      default: 0,
    },
    description: String,
  },
  { timestamps: true },
);

// Cascade delete expenses and balances when group is deleted
groupSchema.pre("findByIdAndDelete", async function (next) {
  const groupId = this.getFilter()._id;
  try {
    // Delete associated expenses
    await mongoose.model("Expense").deleteMany({ group: groupId });
    // Delete associated balances
    await mongoose.model("Balance").deleteMany({ group: groupId });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Group", groupSchema);
