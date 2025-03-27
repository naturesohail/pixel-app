import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/public/assets/css/bootstrap.min.css";
import "@/public/assets/css/font-awesome.css";
import "@/public/assets/css/templatemo-hexashop.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hexashop Ecommerce",
  description: "Best ecommerce store",
};

export default function FrontendLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</div>
  );
}
