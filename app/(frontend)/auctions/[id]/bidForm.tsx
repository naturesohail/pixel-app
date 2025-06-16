"use client";

import Timer from "@/app/components/Timer";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BidForm({
  activeAuctionZone,
  config,
}: {
  activeAuctionZone: any;
  config: any;
}) {
  const userData = localStorage.getItem("userData");
  const userId = userData ? JSON.parse(userData)?._id : undefined;
  console.log("userId :>> ", userId);

  const [bidAmount, setbidAmount] = useState<number | string>("");

  const [product, setProduct] = useState({
    title: "",
    description: "",
    images: [],
    url: "",
    category: "",
  });
  const [isOneTimePurchase, setIsOneTimePurchase] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/pixels/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          pixelCount: activeAuctionZone?.totalPixels,
          bidAmount,
          product,
          isOneTimePurchase,
          zoneId: activeAuctionZone._id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Bid placed successfully!");
      } else {
        setMessage(data.error || "Failed to place bid.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while placing the bid.");
    }
  };

  console.log("activeAuctionZone :>> ", activeAuctionZone);

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Place a Bid
      </h2>

      <div className="mb-6">
        <Timer />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Pixels
          </label>
          <input
            className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
            type="number"
            placeholder="Pixel Count"
            value={activeAuctionZone?.totalPixels}
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Set Your Price (per pixel)
          </label>
          <input
            className="w-full border border-gray-300 rounded-md p-2"
            type="number"
            placeholder="Enter your bid amount"
            value={bidAmount}
            onChange={(e) => setbidAmount(Number(e.target.value))}
            required
          />

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Instant Purchase Price:{" "}
              <strong>${activeAuctionZone?.buyNowPrice}/pixel</strong>
            </span>
            <Link
              href={`/buy-it-now/${activeAuctionZone._id}`}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              Buy it Now
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          Submit Bid
        </button>
      </form>

      {message && (
        <p className="mt-6 text-sm text-center text-gray-700">{message}</p>
      )}
    </div>
  );
}
