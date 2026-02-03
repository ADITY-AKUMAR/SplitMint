import React from "react";
import { formatCurrency } from "../utils/formatting";
import { useAuth } from "../hooks/useAuth";

export const BalanceTable = ({ balances }) => {
  const { user } = useAuth();
  const currentUserId = user?._id ? String(user._id) : String(user || "");
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Balance Details</h2>

      {!balances || balances.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Everyone is settled up!
        </p>
      ) : (
        <div className="space-y-3">
          {balances.map((balance, index) => {
            const debtorName =
              balance.debtor?.name ||
              balance.debtorName ||
              String(balance.debtor);
            const creditorName =
              balance.creditor?.name ||
              balance.creditorName ||
              String(balance.creditor);

            const debtorId = balance.debtor?._id
              ? String(balance.debtor._id)
              : String(balance.debtor || "");
            const creditorId = balance.creditor?._id
              ? String(balance.creditor._id)
              : String(balance.creditor || "");

            // Determine relationship to current user
            const isCurrentDebtor =
              debtorId && currentUserId && debtorId === currentUserId;
            const isCurrentCreditor =
              creditorId && currentUserId && creditorId === currentUserId;

            // Pick color and label based on direction
            let amountClass = "text-gray-800";
            let label = "owes";
            if (isCurrentDebtor) {
              amountClass = "text-red-600";
              label = "you owe";
            } else if (isCurrentCreditor) {
              amountClass = "text-green-600";
              label = "owes you";
            } else {
              amountClass = "text-gray-700";
              label = "owes";
            }

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 transition ${isCurrentDebtor ? "bg-red-50" : isCurrentCreditor ? "bg-green-50" : "bg-gray-50"}`}
              >
                <div className="flex-1">
                  <span className="font-semibold">{debtorName}</span>
                  <span className="text-gray-500 mx-3">→</span>
                  <span className="font-semibold">{creditorName}</span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${amountClass}`}>
                    {formatCurrency(balance.amount)}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BalanceTable;
