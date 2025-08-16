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
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("userData");
      localStorage.removeItem("authToken");
    }
  };

  useEffect(() => {
    async function checkLogin() {
      setIsLoading(true);

      const localUser = localStorage.getItem("userData");
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);

            const res = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
          });

          if (res.ok) {
            const data = await res.json();

            if (data.user?.isActive) {
              setUser(data.user);
              localStorage.setItem("userData", JSON.stringify(data.user));
            } else {
              await logout();
            }
          } else {
            await logout();
          }
        } catch (e) {
          console.error("Auth check failed:", e);
          await logout();
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user?.isActive) {
            setUser(data.user);
            localStorage.setItem("userData", JSON.stringify(data.user));
          } else {
            await logout();
          }
        } else {
          await logout();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        await logout();
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
        logout,
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
