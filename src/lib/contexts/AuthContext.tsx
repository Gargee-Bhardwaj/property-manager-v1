"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { User } from "../auth";
import { loginApi, getUserProfileApi } from "../apis/auth";

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // Remove createOrganization and addMemberToOrganization for now, as they depend on mock logic
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored token and user on mount
    const token = localStorage.getItem("access_token");
    if (token) {
      getUserProfileApi(token)
        .then((profile) => setUser(profile))
        .catch(() => {
          setUser(null);
          localStorage.removeItem("access_token");
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { access_token } = await loginApi(email, password);
      localStorage.setItem("access_token", access_token);
      const profile = await getUserProfileApi(access_token);
      setUser(profile);
      return true;
    } catch (error) {
      setUser(null);
      localStorage.removeItem("access_token");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export async function getCurrentUser() {
  if (typeof window !== "undefined") {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  }
  return null;
}
