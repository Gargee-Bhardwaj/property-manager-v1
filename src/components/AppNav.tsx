"use client";
import { useAuth } from "../lib/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AppNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1
              className="text-xl font-semibold cursor-pointer"
              onClick={() => router.push("/")}
            >
              Property Manager
            </h1>
          </div>
          <div className="flex items-center">
            {!user ? (
              <button
                onClick={() => router.push("/login")}
                className="text-sm cursor-pointer font-semibold text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded transition"
              >
                Sign In
              </button>
            ) : (
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
