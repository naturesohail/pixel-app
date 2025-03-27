
import type { Metadata } from "next";
import Sidebar from "../components/admin/Sidebar";
import "../globals.css"; // Use separate admin styles

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your products, orders, and settings",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
