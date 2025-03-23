import type { Metadata } from "next";
import Sidebar from "../components/admin/Sidebar";
import "../globals.css";


export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your products, orders, and settings",
};

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>
      <body>

        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
