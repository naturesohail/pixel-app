"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { OrderDetails } from "@/app/types/orderTypes";

export default function SuccessPage() {
  const { session_id } = useParams();
  const [status, setStatus] = useState("Checking payment...");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (!session_id) return;

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/checkout/${session_id}`);

        if (!response.ok) throw new Error("Failed to verify payment");

        const data: OrderDetails = await response.json();

        if (data.paymentStatus === "paid") {
          setStatus("🎉 Payment Successful! Thank you for your purchase.");
          setOrderDetails(data);
        } else {
          setStatus("⚠️ Payment is still pending. Please check your email for confirmation.");
        }
      } catch (error) {
        setStatus("❌ Error verifying payment.");
      }
    };

    checkPaymentStatus();
  }, [session_id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white text-gray-900 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center"
      >
        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {status}
        </motion.h1>

        {orderDetails && (
          <motion.div
            className="bg-gray-100 p-5 rounded-lg shadow-inner flex flex-col items-center space-y-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-lg font-medium w-full">
              <p className="truncate">🔹 Order ID: <span className="font-bold text-gray-700">{orderDetails.sessionId}</span></p>
            </div>
            <p className="text-lg">💰 Amount Paid: <span className="font-bold text-green-600">${orderDetails.amount / 100}</span></p>
            <p className={`text-lg font-semibold ${orderDetails.paymentStatus === "paid" ? "text-green-500" : "text-yellow-500"}`}>
              ✅ Payment Status: {orderDetails.paymentStatus}
            </p>
          </motion.div>
        )}

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full shadow-md transition-all"
            >
              Go Back Home
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
