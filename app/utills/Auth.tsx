"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "./Spinner";

const adminRoutes = [
  "/admin/dashboard",
  "/admin/projects",
  "/admin/properties",
  "/admin/amenities",
  "/admin/specifications",
];

export default function Auth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure we are on client side before accessing localStorage
    if (typeof window !== "undefined") {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

      if (adminRoutes.includes(pathname) && !isAuthenticated) {
        router.replace("/login"); // Use `replace` instead of `push`
      }
    }

    setIsLoading(false);
  }, [pathname, router]);

  if (isLoading) return <Spinner />;

  return null; // No need to render anything once auth is checked
}
