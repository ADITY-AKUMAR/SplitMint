import React, { useEffect, useState } from "react";
import { expenseService } from "../services/api";
import { formatCurrency } from "../utils/formatting";

export const SettlementSuggestions = ({ groupId, totalOutstanding }) => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettlements();
  }, [groupId]);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await expenseService.getSettlements(groupId);
      setSettlements(response.data.settlements || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch settlements");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Settlement Suggestions</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Settlement Suggestions</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {settlements.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-semibold">✓ All settled up!</p>
          <p className="text-green-700 text-sm mt-1">
            No outstanding balances in this group.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-4">
            <strong>Outstanding:</strong> {formatCurrency(totalOutstanding)}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-3">
              Minimal Settlements ({settlements.length} transactions)
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              These are the minimum number of payments to settle all debts:
            </p>

            <div className="space-y-2">
              {settlements.map((settlement, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded border border-blue-100 hover:bg-blue-50 transition"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {settlement.fromName}
                    </div>
                    <div className="text-sm text-gray-600">pays</div>
                  </div>

                  <div className="text-center px-4">
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(settlement.amount)}
                    </div>
                    <div className="text-xs text-gray-500">→</div>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="font-semibold text-gray-800">
                      {settlement.toName}
                    </div>
                    <div className="text-sm text-gray-600">receives</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <strong>How it works:</strong> This algorithm minimizes the number
            of transactions needed to settle all debts. Each row represents a
            single payment that should be made.
          </div>
        </div>
      )}

      <button
        onClick={fetchSettlements}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
      >
        Refresh Settlements
      </button>
    </div>
  );
};

export default SettlementSuggestions;
