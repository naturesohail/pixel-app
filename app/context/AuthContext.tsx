"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  _id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  isAdmin: boolean;
  isActive: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST", 
        credentials: "include" 
      });
      setUser(null);
      localStorage.removeItem("userData");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    async function checkLogin() {
      try {
        // First check localStorage for quick hydration
        const localUser = localStorage.getItem("userData");
        if (localUser) {
          setUser(JSON.parse(localUser));
        }

        // Then verify with the server
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("userData", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("userData");
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem("userData");
      } finally {
        setIsLoading(false);
      }
    }

    checkLogin();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoggedIn: !!user, 
        isLoading,
        login,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}