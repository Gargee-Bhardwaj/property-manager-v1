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
import { useRouter } from "next/navigation";

export type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize state from localStorage after component mounts
  useEffect(() => {
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      getUserProfileApi(token)
        .then((profile) => setUser(profile as User))
        .catch(() => {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
          }
          setToken(null);
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const { access_token } = (await loginApi(email, password)) as {
        access_token: string;
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", access_token);
      }
      setToken(access_token);
      const profile = await getUserProfileApi(access_token);
      setUser(profile as User);
      return true;
    } catch (error) {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
      setToken(null);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
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
