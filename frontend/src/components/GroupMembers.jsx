import React, { useState } from "react";
import { groupService } from "../services/api";

export const GroupMembers = ({ groupId, participants, owner, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    color: "",
  });

  const handleEditClick = (index, participant) => {
    setEditingIndex(index);
    setEditFormData({
      name: participant.name || "",
      color: participant.color || "#3B82F6",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = async (index) => {
    setLoading(true);
    setError("");

    try {
      await groupService.updateParticipant(
        groupId,
        index,
        editFormData.name,
        editFormData.color,
      );
      setEditingIndex(null);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update participant");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (index) => {
    if (index === 0) {
      setError("Cannot remove group owner");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await groupService.removeParticipant(groupId, index);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove participant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Group Members</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {participants && participants.length > 0 ? (
          participants.map((participant, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{
                    backgroundColor: participant.color || "#3B82F6",
                  }}
                ></div>

                {editingIndex === index ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      disabled={loading}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="color"
                      name="color"
                      value={editFormData.color}
                      onChange={handleEditChange}
                      disabled={loading}
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => handleEditSubmit(index)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      disabled={loading}
                      className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {participant.name || "Unknown"}
                        {index === 0 && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Owner
                          </span>
                        )}
                      </div>
                      {participant.userId && participant.userId.email && (
                        <div className="text-sm text-gray-500">
                          {participant.userId.email}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {index !== 0 && (
                        <>
                          <button
                            onClick={() => handleEditClick(index, participant)}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(index)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No members yet</p>
        )}
      </div>
    </div>
  );
};

export default GroupMembers;
