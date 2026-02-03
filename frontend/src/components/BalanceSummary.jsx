import React from "react";
import { formatCurrency } from "../utils/formatting";

// Shows three summary cards: total spent (group), you are owed, you owe
export const BalanceSummary = ({
  totalSpent = 0,
  totalOwed = 0,
  totalOwes = 0,
}) => {
  const netBalance = totalOwed - totalOwes;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-lg shadow-md p-6">
        <div className="text-sm font-semibold opacity-90">Total Spent</div>
        <div className="text-3xl font-bold mt-2">
          {formatCurrency(totalSpent)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg shadow-md p-6">
        <div className="text-sm font-semibold opacity-90">You are Owed</div>
        <div className="text-3xl font-bold mt-2">
          {formatCurrency(totalOwed)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-lg shadow-md p-6">
        <div className="text-sm font-semibold opacity-90">You Owe</div>
        <div className="text-3xl font-bold mt-2">
          {formatCurrency(totalOwes)}
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
