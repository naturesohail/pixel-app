"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  _id: string;
  email: string;
  name:string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkLogin();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
