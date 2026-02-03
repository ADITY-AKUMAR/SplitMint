import React, { useState } from "react";
import { formatCurrency, formatDate } from "../utils/formatting";

export const MemberSpending = ({ participants, expenses, balances }) => {
  const [expandedMember, setExpandedMember] = useState(null);

  // Calculate detailed member spending and balance
  const memberData = {};

  participants.forEach((participant) => {
    const id = participant.userId
      ? participant.userId._id || participant.userId
      : null;
    memberData[id] = {
      name:
        participant.name ||
        (participant.userId && participant.userId.name) ||
        "Unknown",
      totalSpent: 0, // What they paid
      totalOwes: 0, // Their share in expenses
      count: 0,
    };
  });

  // Calculate what each member paid
  expenses.forEach((expense) => {
    const payerId = expense.payer?._id
      ? expense.payer._id.toString()
      : String(expense.payer);

    if (memberData[payerId]) {
      memberData[payerId].totalSpent += expense.amount || 0;
      memberData[payerId].count += 1;
    }

    // Calculate what each member owes (their share)
    if (expense.participants && expense.participants.length > 0) {
      expense.participants.forEach((participant) => {
        const participantId = participant.userId?._id
          ? participant.userId._id.toString()
          : String(participant.userId || "");

        if (memberData[participantId]) {
          memberData[participantId].totalOwes += participant.amount || 0;
        }
      });
    }
  });

  // Calculate net balance for each member and filter those with activity
  const sortedMembers = Object.entries(memberData)
    .map(([id, data]) => ({
      id,
      ...data,
      balance: data.totalSpent - data.totalOwes, // positive = owed money, negative = owes money
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .filter((member) => member.count > 0 || member.totalOwes > 0);

  // Get member expenses map
  const memberExpenses = {};
  expenses.forEach((expense) => {
    const payerId = expense.payer?._id
      ? expense.payer._id.toString()
      : String(expense.payer);
    if (!memberExpenses[payerId]) {
      memberExpenses[payerId] = [];
    }
    memberExpenses[payerId].push(expense);
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Member Spending & Balance</h2>

      {sortedMembers.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No expenses added yet</p>
      ) : (
        <div className="space-y-3">
          {sortedMembers.map(
            ({ id: memberId, name, totalSpent, totalOwes, count, balance }) => (
              <div
                key={memberId}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Member Summary */}
                <button
                  onClick={() =>
                    setExpandedMember(
                      expandedMember === memberId ? null : memberId,
                    )
                  }
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-lg">{name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {count} {count === 1 ? "expense" : "expenses"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 flex-1 mx-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Spent</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(totalSpent)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Owes</div>
                      <div className="text-lg font-bold text-orange-600">
                        {formatCurrency(totalOwes)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Balance</div>
                      <div
                        className={`text-lg font-bold ${
                          balance >= 0 ? "text-blue-600" : "text-red-600"
                        }`}
                      >
                        {balance >= 0 ? "+" : ""}
                        {formatCurrency(balance)}
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-400 ml-4">
                    {expandedMember === memberId ? "▼" : "▶"}
                  </div>
                </button>

                {/* Expanded Expenses List */}
                {expandedMember === memberId && (
                  <div className="bg-white border-t border-gray-200 p-4">
                    <div className="mb-4">
                      <h3 className="font-bold mb-3">Transaction Details</h3>
                      <div className="space-y-3">
                        {(memberExpenses[memberId] || [])
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((expense) => {
                            const payerName =
                              expense.payer?.name ||
                              expense.payerName ||
                              "Unknown";
                            const isCurrentMember =
                              (
                                expense.payer?._id || expense.payer
                              )?.toString() === memberId?.toString();

                            return (
                              <div
                                key={expense._id}
                                className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {expense.description}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatDate(expense.date)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg">
                                      {formatCurrency(expense.amount)}
                                    </div>
                                    {isCurrentMember && (
                                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1">
                                        Paid by {payerName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div>
                                    Split:{" "}
                                    <span className="capitalize font-semibold">
                                      {expense.splitMode}
                                    </span>
                                  </div>
                                  <div>
                                    Participants:{" "}
                                    {expense.participants?.length || 0} people
                                  </div>
                                  {expense.participants &&
                                    expense.participants.length > 0 && (
                                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                        <div className="font-semibold text-gray-700 mb-1">
                                          Split Details:
                                        </div>
                                        <div className="space-y-1">
                                          {expense.participants.map(
                                            (p, idx) => (
                                              <div
                                                key={idx}
                                                className="flex justify-between text-xs"
                                              >
                                                <span>
                                                  {p.name ||
                                                    p.userId?.name ||
                                                    "Unknown"}
                                                </span>
                                                <span className="font-semibold">
                                                  {formatCurrency(p.amount)}
                                                </span>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Member Balance Summary */}
                    <div className="border-t pt-4 mt-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>{name}'s Summary:</strong>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total Paid:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(totalSpent)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Share in Expenses:</span>
                            <span className="font-bold text-orange-600">
                              {formatCurrency(totalOwes)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-1 mt-1">
                            <span>
                              <strong>
                                {balance >= 0 ? "Gets Back:" : "Still Owes:"}
                              </strong>
                            </span>
                            <span
                              className={`font-bold text-lg ${
                                balance >= 0 ? "text-blue-600" : "text-red-600"
                              }`}
                            >
                              {balance >= 0 ? "+" : ""}
                              {formatCurrency(balance)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      )}

      {/* Summary Stats */}
      {sortedMembers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-2xl font-bold text-blue-600">
                {expenses.length}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
                )}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Active Members</div>
              <div className="text-2xl font-bold text-purple-600">
                {sortedMembers.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberSpending;
