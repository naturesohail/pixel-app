"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";
import "../../globals.css"; 

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== cPassword) {
      Swal.fire({
        title: "Error!",
        text: "Passwords do not match",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email,phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      Swal.fire({
        title: "Registration Successful!",
        text: "You can now log in",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        router.push("/register");
      });

    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Something went wrong",
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
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="input-field mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Your Name"
            />
          </div>
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
              Contact No
            </label>
            <input
              id="contact"
              type="number"
              required
              className="input-field mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter Your Contact No"
            />
          </div>

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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@example.com"
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>

          <div>
            <label htmlFor="cPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="cPassword"
              type="password"
              required
              className="input-field mt-1"
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
              placeholder="Confirm Password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full text-center text-lg font-medium"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>

          <div className="w-full text-center font-medium mt-4">
            <Link href="/login">Already have an account? Login</Link>
          </div>

        </form>
      </div>
    </div>
  );
}
