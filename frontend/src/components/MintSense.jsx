import React, { useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { expenseService } from "../services/api";
import {
  parseNaturalExpense,
  generateGroupSummary,
  suggestSettlementsFromBalances,
} from "../utils/mintSense";
import { formatCurrency } from "../utils/formatting";

const MintSense = ({
  groupId,
  participants = [],
  expenses = [],
  balances = [],
  onAdd,
}) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const participantMap = useMemo(() => {
    const m = {};
    (participants || []).forEach((p) => {
      const id = p.userId?._id ? String(p.userId._id) : String(p.userId || "");
      m[id] = p.name || (p.userId && p.userId.name) || id;
    });
    return m;
  }, [participants]);

  const handleParse = () => {
    const result = parseNaturalExpense(text, participants, user);
    setParsed(result);
  };

  const handleCreate = async () => {
    if (!parsed || !parsed.amount) {
      setError("Parsed amount is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Build participants payload: use selected participants or default to parsed participants
      const selected =
        parsed.participants && parsed.participants.length > 0
          ? parsed.participants
          : participants.map((p) => ({
              userId: p.userId?._id || p.userId,
              name: p.name || (p.userId && p.userId.name),
              amount: 0,
            }));

      const num = selected.length || 1;
      const per = parseFloat((parsed.amount / num).toFixed(2));

      const apiParticipants = selected.map((p) => ({
        userId: p.userId,
        name: p.name,
        amount: per,
      }));

      await expenseService.createExpense(
        groupId,
        parseFloat(parsed.amount),
        parsed.description,
        parsed.date || new Date().toISOString().split("T")[0],
        apiParticipants,
        parsed.splitMode || "equal",
        parsed.notes || "",
      );

      setParsed(null);
      setText("");
      onAdd?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create expense");
    } finally {
      setLoading(false);
    }
  };

  const summaryText = useMemo(
    () => generateGroupSummary(expenses, participants),
    [expenses, participants],
  );
  const suggestions = useMemo(
    () => suggestSettlementsFromBalances(balances),
    [balances],
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-3">
        MintSense — Natural Language Entry
      </h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          'E.g. "I paid $120 for dinner for Alice and Bob yesterday"'
        }
        className="w-full p-3 border border-gray-300 rounded mb-3"
        rows={3}
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleParse}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Parse
        </button>
        <button
          onClick={() => {
            setText("");
            setParsed(null);
            setError("");
          }}
          className="px-3 py-2 bg-gray-200 rounded"
        >
          Clear
        </button>
      </div>

      {parsed && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Parsed Expense</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-500">Amount</div>
              <div className="font-bold text-lg">
                {formatCurrency(parsed.amount || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Description</div>
              <div className="font-medium">{parsed.description}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Date</div>
              <div className="font-medium">{parsed.date || "—"}</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs text-gray-500">Participants</div>
            <div className="flex gap-2 flex-wrap mt-2">
              {(parsed.participants && parsed.participants.length > 0
                ? parsed.participants
                : participants.map((p) => ({
                    userId: p.userId?._id || p.userId,
                    name: p.name || (p.userId && p.userId.name),
                  }))
              ).map((p, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 bg-gray-100 rounded text-sm"
                >
                  {p.name || p.userId || "Unknown"}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-3 py-2 bg-green-600 text-white rounded"
            >
              {loading ? "Creating..." : "Create Expense"}
            </button>
            <div className="text-sm text-red-600">{error}</div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-semibold mb-2">AI Summary</h3>
        <div className="text-sm text-gray-700">{summaryText}</div>

        <h4 className="mt-3 font-semibold">Settlement Suggestions</h4>
        {suggestions.length === 0 ? (
          <div className="text-sm text-gray-500">No outstanding balances</div>
        ) : (
          <ul className="text-sm space-y-1 mt-2">
            {suggestions.map((s, idx) => (
              <li key={idx}>
                <strong>{participantMap[s.from] || s.from}</strong> →{" "}
                <strong>{participantMap[s.to] || s.to}</strong>:{" "}
                {formatCurrency(s.amount)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MintSense;
