import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { groupService } from "../services/api";
import { formatCurrency } from "../utils/formatting";

export const HomePage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getGroups();
      setGroups(response.data.groups);
    } catch (err) {
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Groups</h1>
          <Link
            to="/groups/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            + Create Group
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No groups yet. Create one to get started!
            </p>
            <Link
              to="/groups/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Group
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold mb-2">{group.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {group.participants.length} participants
                </p>
                <div className="border-t pt-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(group.totalSpent)}
                  </div>
                  <p className="text-gray-600 text-xs">Total spent</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
