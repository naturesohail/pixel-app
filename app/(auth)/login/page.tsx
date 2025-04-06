"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link"
import "../../globals.css"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      Swal.fire({
        title: "Login Successful!",
        text: "Welcome to Uptown Admin Dashboard",
        icon: "success",
        timer: 500,
        showConfirmButton: false,
      }).then(() => {
        localStorage.setItem("authToken", data.token);

        router.push("/");
      });

    } catch (error: any) {
      Swal.fire({
        title: "Login Failed!",
        text: error.message || "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Pixel App</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field mt-1"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="input-field mt-1"
              value={password}
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full text-center text-lg font-medium"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button> 

          <span className="w-full text-center font-medium">
          <span></span>

            <Link href="/register">
              Don't have  an account?
              Register
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}
