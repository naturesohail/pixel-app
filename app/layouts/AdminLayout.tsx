


import type { Metadata } from "next";
import Sidebar from "../components/admin/Sidebar";
import "../globals.css";

import Head from "next/head";
export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your products, orders, and settings",
};

export default function AdminLayout({
  children,
}:
  { children: React.ReactNode }) {


  return (
    <>


      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <script src="https://cdn.tailwindcss.com"></script>

      </head>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </>

  );
}
