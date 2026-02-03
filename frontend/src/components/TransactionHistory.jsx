import React, { useState, useMemo } from "react";
import { expenseService } from "../services/api";
import { formatCurrency, formatDate } from "../utils/formatting";
import { useAuth } from "../hooks/useAuth";

export const TransactionHistory = ({ expenses, onUpdate }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const currentUserId = user?._id ? String(user._id) : String(user || "");

  // Filters
  const [search, setSearch] = useState("");
  const [payerFilter, setPayerFilter] = useState("");
  const [participantFilter, setParticipantFilter] = useState("");
  const [splitModeFilter, setSplitModeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const handleDelete = async (expenseId) => {
    if (
      !window.confirm(
        "Delete this expense? This will recalculate all balances.",
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await expenseService.deleteExpense(expenseId);
      onUpdate?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Search description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />

        <div className="flex gap-2">
          <select
            value={participantFilter}
            onChange={(e) => setParticipantFilter(e.target.value)}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All participants</option>
            {useMemo(() => {
              const map = new Map();
              (expenses || []).forEach((ex) => {
                (ex.participants || []).forEach((p) => {
                  const id = p.userId?._id
                    ? String(p.userId._id)
                    : p.name || p.userId?.name || "";
                  const label = p.name || p.userId?.name || "Unknown";
                  if (!map.has(id)) map.set(id, label);
                });
              });
              return Array.from(map.entries()).map(([id, label]) => (
                <option key={id || label} value={id}>
                  {label}
                </option>
              ));
            }, [expenses])}
          </select>

          <select
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All payers</option>
            {Array.from(
              new Set(expenses.map((e) => e.payerName || e.payer?.name)),
            ).map((p, idx) => (
              <option key={p || idx} value={p || ""}>
                {p || "Unknown"}
              </option>
            ))}
          </select>

          <select
            value={splitModeFilter}
            onChange={(e) => setSplitModeFilter(e.target.value)}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All splits</option>
            <option value="equal">Equal</option>
            <option value="custom">Custom</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-1/2"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-1/2"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-1/2"
          />
          <input
            type="number"
            placeholder="Max amount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-1/2"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSearch("");
              setPayerFilter("");
              setSplitModeFilter("");
              setFromDate("");
              setToDate("");
              setMinAmount("");
              setMaxAmount("");
            }}
            className="px-3 py-2 bg-gray-200 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No expenses yet</p>
        ) : (
          // apply filters
          (expenses || [])
            .filter((expense) => {
              // search across description, notes, and participant names
              if (search) {
                const q = search.toLowerCase();
                const inDesc = expense.description?.toLowerCase().includes(q);
                const inNotes = expense.notes?.toLowerCase().includes(q);
                const inParticipants = (expense.participants || []).some(
                  (p) => {
                    const name = (p.name || p.userId?.name || "").toLowerCase();
                    return name.includes(q);
                  },
                );
                if (!inDesc && !inNotes && !inParticipants) return false;
              }

              if (
                payerFilter &&
                (expense.payerName || expense.payer?.name) !== payerFilter
              )
                return false;

              if (participantFilter) {
                const matches = (expense.participants || []).some((p) => {
                  const id = p.userId?._id
                    ? String(p.userId._id)
                    : p.name || p.userId?.name || "";
                  return id === participantFilter;
                });
                if (!matches) return false;
              }

              if (splitModeFilter && expense.splitMode !== splitModeFilter)
                return false;
              if (fromDate && new Date(expense.date) < new Date(fromDate))
                return false;
              if (
                toDate &&
                new Date(expense.date) > new Date(toDate + "T23:59:59")
              )
                return false;
              if (minAmount && (expense.amount || 0) < parseFloat(minAmount))
                return false;
              if (maxAmount && (expense.amount || 0) > parseFloat(maxAmount))
                return false;
              return true;
            })
            .map((expense) => (
              <div key={expense._id}>
                {(() => {
                  // determine color: green if current user paid, red if current user is participant (owes), neutral otherwise
                  const payerId = expense.payer?._id
                    ? String(expense.payer._id)
                    : String(expense.payer || "");
                  const isPayer =
                    payerId && currentUserId && payerId === currentUserId;
                  const isParticipant = (expense.participants || []).some(
                    (p) => {
                      const pid = p.userId?._id
                        ? String(p.userId._id)
                        : String(p.userId || "");
                      return (
                        pid &&
                        currentUserId &&
                        pid === currentUserId &&
                        pid !== payerId &&
                        (p.amount || 0) > 0
                      );
                    },
                  );

                  const entryBorder = isPayer
                    ? "border-l-4 border-green-400"
                    : isParticipant
                      ? "border-l-4 border-red-400"
                      : "border-l-2 border-gray-200";

                  return (
                    <div
                      className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer ${entryBorder}`}
                      onClick={() =>
                        setExpandedId(
                          expandedId === expense._id ? null : expense._id,
                        )
                      }
                    >
                      <div className="flex-1">
                        <div className="font-semibold">
                          {expense.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(expense.date)} • Paid by{" "}
                          {expense.payerName}
                        </div>
                      </div>

                      <div className="text-right mr-4">
                        <div className="font-bold text-lg">
                          {formatCurrency(expense.amount)}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {expense.splitMode} split
                        </div>
                      </div>

                      <button
                        className="text-gray-400 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(
                            expandedId === expense._id ? null : expense._id,
                          );
                        }}
                      >
                        {expandedId === expense._id ? "▼" : "▶"}
                      </button>
                    </div>
                  );
                })()}

                {/* Expanded details */}
                {expandedId === expense._id && !editingId && (
                  <div className="bg-white border-l-4 border-blue-500 ml-4 p-4 mb-2 rounded">
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Participants ({expense.participants?.length || 0}):
                      </div>
                      <div className="space-y-1">
                        {expense.participants?.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span>{p.name || p.userId?.name || "Unknown"}</span>
                            <span className="font-semibold">
                              {formatCurrency(p.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {expense.notes && (
                      <div className="mb-3 pt-3 border-t">
                        <div className="text-sm text-gray-600">
                          <strong>Notes:</strong> {expense.notes}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={() => setEditingId(expense._id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit form */}
                {editingId === expense._id && (
                  <EditExpenseForm
                    expenseId={expense._id}
                    initialData={expense}
                    onClose={() => setEditingId(null)}
                    onUpdate={() => {
                      setEditingId(null);
                      onUpdate?.();
                    }}
                  />
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

// Edit expense form component
const EditExpenseForm = ({ expenseId, initialData, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    amount: initialData.amount,
    description: initialData.description,
    date:
      initialData.date?.split("T")[0] || new Date().toISOString().split("T")[0],
    splitMode: initialData.splitMode || "equal",
    notes: initialData.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use existing participants for update
      await expenseService.updateExpense(
        expenseId,
        parseFloat(formData.amount),
        formData.description,
        formData.date,
        initialData.participants,
        formData.splitMode,
        formData.notes,
      );
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-l-4 border-amber-500 ml-4 p-4 mb-2 rounded">
      <h3 className="font-bold mb-3">Edit Expense</h3>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Amount"
        />

        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Description"
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <select
          name="splitMode"
          value={formData.splitMode}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="equal">Equal Split</option>
          <option value="custom">Custom Amounts</option>
          <option value="percentage">Percentage</option>
        </select>

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Notes (optional)"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-3 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Expense"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionHistory;
