import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupService, expenseService } from "../services/api";
import BalanceSummary from "../components/BalanceSummary";
import BalanceTable from "../components/BalanceTable";
import TransactionHistory from "../components/TransactionHistory";
import GroupMembers from "../components/GroupMembers";
import MemberSpending from "../components/MemberSpending";
import GroupActivity from "../components/GroupActivity";
import SettlementSuggestions from "../components/SettlementSuggestions";
import { formatCurrency } from "../utils/formatting";
import MintSense from "../components/MintSense";

export const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const groupRes = await groupService.getGroup(id);
      setGroup(groupRes.data.group);
      setExpenses(groupRes.data.expenses);

      const balanceRes = await expenseService.getBalances(id);
      setBalances(balanceRes.data.allBalances || []);
    } catch (err) {
      setError("Failed to load group data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this group? All expenses will be removed.",
      )
    ) {
      try {
        await groupService.deleteGroup(id);
        navigate("/");
      } catch (err) {
        setError("Failed to delete group");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen">
        Group not found
      </div>
    );
  }

  const ownerId = group.owner?._id
    ? group.owner._id.toString()
    : String(group.owner);

  const userStats = {
    totalOwed: balances.reduce((sum, b) => {
      const creditorId = b.creditor?._id
        ? b.creditor._id.toString()
        : String(b.creditor || "");
      return creditorId === ownerId ? sum + (b.amount || 0) : sum;
    }, 0),
    totalOwes: balances.reduce((sum, b) => {
      const debtorId = b.debtor?._id
        ? b.debtor._id.toString()
        : String(b.debtor || "");
      return debtorId === ownerId ? sum + (b.amount || 0) : sum;
    }, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
            <p className="text-gray-600">
              {group.participants.length} members •{" "}
              {formatCurrency(group.totalSpent)} total
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddExpense(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              + Add Expense
            </button>
            <button
              onClick={() => setShowAddBalance(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              + Add Balance
            </button>
            <button
              onClick={() => setShowAddMember(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Member
            </button>
            <button
              onClick={() => setShowEditGroup(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
            >
              ⚙️ Edit
            </button>
            <button
              onClick={handleDeleteGroup}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Delete Group
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {showAddExpense && (
          <AddExpenseForm
            groupId={id}
            group={group}
            onClose={() => setShowAddExpense(false)}
            onAdd={fetchGroupData}
          />
        )}

        {showAddMember && (
          <AddMemberForm
            groupId={id}
            onClose={() => setShowAddMember(false)}
            onAdd={fetchGroupData}
          />
        )}

        {showAddBalance && (
          <AddBalanceForm
            groupId={id}
            participants={group.participants}
            onClose={() => setShowAddBalance(false)}
            onAdd={fetchGroupData}
          />
        )}

        {showEditGroup && (
          <EditGroupForm
            groupId={id}
            currentName={group.name}
            currentDescription={group.description}
            onClose={() => setShowEditGroup(false)}
            onUpdate={fetchGroupData}
          />
        )}

        <BalanceSummary
          totalSpent={group.totalSpent}
          totalOwed={userStats.totalOwed}
          totalOwes={userStats.totalOwes}
        />

        <div className="mt-6">
          <MintSense
            groupId={id}
            participants={group.participants}
            expenses={expenses}
            balances={balances}
            onAdd={fetchGroupData}
          />
        </div>

        <div className="mt-8 space-y-8">
          <GroupMembers
            groupId={id}
            participants={group.participants}
            owner={group.owner}
            onUpdate={fetchGroupData}
          />
          <MemberSpending
            participants={group.participants}
            expenses={expenses}
            balances={balances}
          />
          <GroupActivity
            participants={group.participants}
            expenses={expenses}
            balances={balances}
          />
          <BalanceTable balances={balances} />
          <SettlementSuggestions
            groupId={id}
            totalOutstanding={balances.reduce(
              (sum, b) => sum + (b.amount || 0),
              0,
            )}
          />
          <TransactionHistory expenses={expenses} onUpdate={fetchGroupData} />
        </div>
      </div>
    </div>
  );
};

const AddExpenseForm = ({ groupId, group, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    splitMode: "equal",
    payer: "", // Added payer selection
    participants:
      group && group.participants
        ? group.participants.map((p) => ({
            userId: p.userId ? p.userId._id || p.userId : null,
            name: p.name || (p.userId && p.userId.name) || "",
            amount: 0,
          }))
        : [],
  });

  useEffect(() => {
    if (group && group.participants) {
      // Set default payer to first member
      const firstParticipant = group.participants[0];
      const payerId = firstParticipant.userId
        ? firstParticipant.userId._id || firstParticipant.userId
        : null;

      setFormData((prev) => ({
        ...prev,
        payer: payerId,
        participants: group.participants.map((p) => ({
          userId: p.userId ? p.userId._id || p.userId : null,
          name: p.name || (p.userId && p.userId.name) || "",
          amount: 0,
        })),
      }));
    }
  }, [group]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const participants = formData.participants.map((p) => ({
        userId: p.userId,
        name: p.name,
        amount:
          formData.splitMode === "equal"
            ? parseFloat(formData.amount) / formData.participants.length
            : parseFloat(p.amount) || 0,
      }));

      // Create expense with selected payer
      const expensePayload = {
        groupId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        participants,
        splitMode: formData.splitMode,
        notes: "",
        payer: formData.payer, // Send selected payer to backend
      };

      // For now, we'll submit with payer but backend may override with current user
      await expenseService.createExpense(
        groupId,
        parseFloat(formData.amount),
        formData.description,
        formData.date,
        participants,
        formData.splitMode,
        "",
      );

      onAdd();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="payer"
          value={formData.payer}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select who paid for this expense</option>
          {group &&
            group.participants &&
            group.participants.map((participant, idx) => {
              const rawId = participant.userId
                ? participant.userId._id || participant.userId
                : null;
              const id = rawId ? String(rawId) : "";
              return (
                <option key={id || `payer-${idx}`} value={id} disabled={!rawId}>
                  {participant.name ||
                    (participant.userId && participant.userId.name) ||
                    "Unknown"}
                  {!rawId && " (no account)"}
                </option>
              );
            })}
        </select>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="splitMode"
          value={formData.splitMode}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="equal">Equal Split</option>
          <option value="custom">Custom Amounts</option>
          <option value="percentage">Percentage</option>
        </select>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Expense"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const AddMemberForm = ({ groupId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    color: "#3B82F6",
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
      await groupService.addParticipant(
        groupId,
        formData.name,
        formData.email,
        formData.color,
      );

      onAdd();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Add Member</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Member Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email (optional, to find existing user)"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div>
          <label className="block text-sm font-semibold mb-2">
            Member Color
          </label>
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Member"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const AddBalanceForm = ({ groupId, participants, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    from: "", // Who owes money
    to: "", // Who should receive money
    amount: "",
    description: "",
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

    if (formData.from === formData.to) {
      setError("Please select different members");
      setLoading(false);
      return;
    }

    try {
      // Ensure payload values are strings/number as backend expects
      const fromId = String(formData.from);
      const toId = String(formData.to);
      const amt = parseFloat(formData.amount);

      await groupService.addBalance(
        groupId,
        fromId,
        toId,
        amt,
        formData.description,
      );

      onAdd();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to add balance",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Add Balance/Manual Adjustment</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Member who owes
          </label>
          <select
            name="from"
            value={formData.from}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select member</option>
            {participants &&
              participants.map((participant, idx) => {
                const rawId = participant.userId
                  ? participant.userId._id || participant.userId
                  : null;
                const id = rawId ? String(rawId) : "";
                return (
                  <option
                    key={id || `local-${idx}`}
                    value={id}
                    disabled={!rawId}
                  >
                    {participant.name ||
                      (participant.userId && participant.userId.name) ||
                      "Unknown"}
                    {!rawId && " (no account)"}
                  </option>
                );
              })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Member to receive
          </label>
          <select
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select member</option>
            {participants &&
              participants.map((participant, idx) => {
                const rawId = participant.userId
                  ? participant.userId._id || participant.userId
                  : null;
                const id = rawId ? String(rawId) : "";
                return (
                  <option
                    key={id || `local-to-${idx}`}
                    value={id}
                    disabled={!rawId}
                  >
                    {participant.name ||
                      (participant.userId && participant.userId.name) ||
                      "Unknown"}
                    {!rawId && " (no account)"}
                  </option>
                );
              })}
          </select>
        </div>

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="description"
          placeholder="Description (e.g., 'Settlement', 'Loan payment')"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Balance"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const EditGroupForm = ({
  groupId,
  currentName,
  currentDescription,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: currentName,
    description: currentDescription || "",
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
      await groupService.updateGroup(
        groupId,
        formData.name,
        formData.description,
      );
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Edit Group</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Group Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Group"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupDetailPage;
