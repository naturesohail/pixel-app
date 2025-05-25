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

  // Countdown Timer
  // const getMyBids = async (userId: string) => {
  //   const response = await fetch(`/api/pixels/bid?userId=${userId}`);
  //   const data = await response.json();

  //   if (response.ok) {
  //     console.log("✅ Your bids:", data.bids);
  //   } else {
  //     console.error("❌ Error fetching your bids:", data.error);
  //   }
  // };

  // useEffect(()=>{
  //   if(!userId) return
  // getMyBids(userId)
  // },[userId])

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
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Place a Bid</h2>
      <Timer />
      <form onSubmit={handleSubmit} className="space-y-4">
        <label>Total Pixels</label>
        <input
          className="w-full border p-2"
          type="number"
          placeholder="Pixel Count"
          value={activeAuctionZone?.totalPixels}
          disabled
        />
        <label>Set Your Price (1 pixel)</label>
        <div>
          <input
            className="w-full border p-2"
            type="number"
            placeholder="enter your bid amount"
            value={bidAmount}
            onChange={(e) => setbidAmount(Number(e.target.value))}
            required
          />
          <span>
            Instant Purchase Price ${activeAuctionZone?.buyNowPrice}/per pixel{" "}
            <button style={{
              backgroundColor:"green",
              padding:"5px 10px",
              borderRadius:6
            }}>
              <Link
                href={"/buy-it-now/" + activeAuctionZone._id}
                className="hover:text-blue-600"
              >
                Buy it Now
              </Link>
            </button>
          </span>
        </div>

        {/* <label className="flex items-center">
          <input
            type="checkbox"
            checked={isOneTimePurchase}
            onChange={(e) => setIsOneTimePurchase(e.target.checked)}
          />
          <span className="ml-2">One-Time Purchase</span>
        </label> */}

        <button
          type="submit"
          // disabled={timeLeft <= 0}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Submit Bid
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
