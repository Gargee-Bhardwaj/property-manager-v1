"use client";
import { useAuth } from "../lib/contexts/AuthContext";

export default function AppNav() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Re-Saas</h1>
          </div>
          <div className="flex items-center">
            {user && (
              <>
                <span className="text-sm mr-4">
                  Welcome, {user.full_name || user.email}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
