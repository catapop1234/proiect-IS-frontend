"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<string | null>;
  signin: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Record<string, string>) => Promise<string | null>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useTheme() {
  const c = useContext(ThemeContext);
  if (!c) throw new Error("useTheme must be used within ThemeProvider");
  return c;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme;
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((p) => (p === "light" ? "dark" : "light")) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const saved = localStorage.getItem("auth_token");
    if (!saved) {
      setLoading(false);
      return;
    }
    setToken(saved);
    try {
      const data = await api.me();
      if (data.record) {
        setUser(data.record);
      } else {
        localStorage.removeItem("auth_token");
        setToken(null);
      }
    } catch {
      localStorage.removeItem("auth_token");
      setToken(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const signup = async (email: string, password: string, name: string): Promise<string | null> => {
    const data = await api.signup({ email, password, passwordConfirm: password, name });
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.record);
      return null;
    }
    const msg = data?.data ? Object.values(data.data).map((e: any) => e.message).join(", ") : (data.message || "Signup failed");
    return msg;
  };

  const signin = async (email: string, password: string): Promise<string | null> => {
    const data = await api.signin({ email, password });
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.record);
      return null;
    }
    const msg = data?.data ? Object.values(data.data).map((e: any) => e.message).join(", ") : (data.message || "Invalid credentials");
    return msg;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  const updateUserFn = async (data: Record<string, string>): Promise<string | null> => {
    const res = await api.updateUser(data);
    if (res.record) {
      setUser(res.record);
      return null;
    }
    const msg = res?.data ? Object.values(res.data).map((e: any) => e.message).join(", ") : (res.message || "Failed to update");
    return msg;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, signin, logout, refreshUser, updateUser: updateUserFn }}>
      {children}
    </AuthContext.Provider>
  );
}