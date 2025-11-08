
"use client"
import { AuthProvider } from "@/app/context/AuthContext";
import FrontendLayout from "@/app/layouts/FrontendLayout";
import AdminLayout from "@/app/layouts/AdminLayout";
import { usePathname } from "next/navigation";
import "@/public/assets/css/bootstrap.min.css";
import "@/public/assets/css/font-awesome.css";
import "@/public/assets/css/templatemo-hexashop.css";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <head>
       <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

// This component handles layout selection based on path
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  return isAdmin ? <AdminLayout>{children}</AdminLayout> : <FrontendLayout>{children}</FrontendLayout>;
}
