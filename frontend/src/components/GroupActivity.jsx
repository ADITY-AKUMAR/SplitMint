import React from "react";
import { formatCurrency, formatDate } from "../utils/formatting";

const GroupActivity = ({ participants = [], expenses = [], balances = [] }) => {
  // Build participant map for quick lookup
  const participantMap = {};
  participants.forEach((p) => {
    const id = p.userId ? p.userId._id || p.userId : null;
    participantMap[String(id)] =
      p.name || (p.userId && p.userId.name) || "Unknown";
  });

  // Member activity summary
  const memberSummary = {};
  participants.forEach((p) => {
    const id = p.userId ? p.userId._id || p.userId : null;
    memberSummary[String(id)] = {
      name: participantMap[String(id)],
      expensesAdded: 0,
      balancesInvolved: 0,
      lastActive: null,
    };
  });

  expenses.forEach((exp) => {
    const payerId = exp.payer?._id
      ? exp.payer._id.toString()
      : String(exp.payer);
    if (!memberSummary[payerId]) {
      memberSummary[payerId] = {
        name: exp.payerName || "Unknown",
        expensesAdded: 0,
        balancesInvolved: 0,
        lastActive: null,
      };
    }
    memberSummary[payerId].expensesAdded += 1;
    const date = exp.date
      ? new Date(exp.date)
      : new Date(exp.createdAt || Date.now());
    if (
      !memberSummary[payerId].lastActive ||
      memberSummary[payerId].lastActive < date
    ) {
      memberSummary[payerId].lastActive = date;
    }
  });

  balances.forEach((bal) => {
    const debtorId = bal.debtor?._id
      ? bal.debtor._id.toString()
      : String(bal.debtor);
    const creditorId = bal.creditor?._id
      ? bal.creditor._id.toString()
      : String(bal.creditor);
    [debtorId, creditorId].forEach((id) => {
      if (!memberSummary[id]) {
        memberSummary[id] = {
          name: participantMap[id] || "Unknown",
          expensesAdded: 0,
          balancesInvolved: 0,
          lastActive: null,
        };
      }
      memberSummary[id].balancesInvolved += 1;
      const date = bal.updatedAt
        ? new Date(bal.updatedAt)
        : new Date(bal.createdAt || Date.now());
      if (
        !memberSummary[id].lastActive ||
        memberSummary[id].lastActive < date
      ) {
        memberSummary[id].lastActive = date;
      }
    });
  });

  // Build timeline: expenses and balance events
  const events = [];
  expenses.forEach((exp) => {
    events.push({
      type: "expense",
      id: exp._id,
      date: exp.date
        ? new Date(exp.date)
        : new Date(exp.createdAt || Date.now()),
      payerName: exp.payerName || (exp.payer && exp.payer.name) || "Unknown",
      description: exp.description,
      amount: exp.amount,
      participants: exp.participants || [],
      splitMode: exp.splitMode,
    });
  });

  balances.forEach((bal) => {
    events.push({
      type: "balance",
      id: bal._id,
      date: bal.updatedAt
        ? new Date(bal.updatedAt)
        : new Date(bal.createdAt || Date.now()),
      debtorName:
        bal.debtorName || (bal.debtor && bal.debtor.name) || String(bal.debtor),
      creditorName:
        bal.creditorName ||
        (bal.creditor && bal.creditor.name) ||
        String(bal.creditor),
      amount: bal.amount,
    });
  });

  events.sort((a, b) => b.date - a.date);

  const activeMembers = Object.values(memberSummary).sort((a, b) => {
    const aActive = a.lastActive ? a.lastActive.getTime() : 0;
    const bActive = b.lastActive ? b.lastActive.getTime() : 0;
    return bActive - aActive;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Group Activity</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-600">Active Members</div>
          <div className="mt-2 space-y-2">
            {activeMembers.length === 0 ? (
              <div className="text-sm text-gray-500">No activity yet</div>
            ) : (
              activeMembers.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-gray-500">
                      Last active:{" "}
                      {m.lastActive ? formatDate(m.lastActive) : "-"}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>Expenses: {m.expensesAdded}</div>
                    <div>Balances: {m.balancesInvolved}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border rounded md:col-span-2">
          <div className="text-sm text-gray-600 mb-2">Recent Events</div>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-sm text-gray-500">No events yet</div>
            ) : (
              events.map((ev) => (
                <div key={ev.type + ev.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      {ev.type === "expense" ? (
                        <div>
                          <div className="font-medium">{ev.description}</div>
                          <div className="text-xs text-gray-500">
                            Paid by {ev.payerName} • {formatDate(ev.date)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Split: {ev.splitMode} • {ev.participants.length}{" "}
                            people
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">
                            Manual balance adjustment
                          </div>
                          <div className="text-xs text-gray-500">
                            {ev.debtorName} → {ev.creditorName} •{" "}
                            {formatDate(ev.date)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(ev.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupActivity;
