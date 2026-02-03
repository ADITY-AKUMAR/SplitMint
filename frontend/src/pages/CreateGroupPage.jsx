import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { groupService } from "../services/api";

export const CreateGroupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await groupService.createGroup(
        formData.name,
        formData.description,
      );
      navigate(`/groups/${response.data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Create New Group</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Group Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Weekend Trip"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                placeholder="Add details about this group..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Add participants to your group</li>
            <li>Record expenses</li>
            <li>Automatically calculate who owes whom</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
