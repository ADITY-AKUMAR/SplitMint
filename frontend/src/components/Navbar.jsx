import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          💰 SplitMint
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="text-sm">{user.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 hover:bg-blue-700 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
