
"use client"
import type { Metadata } from "next";
import Sidebar from "../components/admin/Sidebar";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your products, orders, and settings",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-40 p-8">{children}</main>
    </div>
  );
}
