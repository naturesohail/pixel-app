"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function BidForm({
  activeAuctionZone,
  config,
  highestBid,
  onNewBid,
}: {
  activeAuctionZone: any;
  config: any;
  highestBid: number;
  onNewBid: (newBid: any) => void;
}) {
  const hasBids = highestBid > 0;

  const minimumAllowedPerPixel = config?.pricePerPixel;

  const currentBidPerPixel = hasBids
    ? highestBid / activeAuctionZone.totalPixels
    : activeAuctionZone.pixelPrice;

  const nextBidPerPixel = Math.max(
    hasBids ? currentBidPerPixel + 1 : currentBidPerPixel,
    minimumAllowedPerPixel
  );

  const [bidPerPixel, setBidPerPixel] = useState<number | string>(nextBidPerPixel);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const userData = localStorage.getItem("userData");
  const userId = userData ? JSON.parse(userData)?._id : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      Swal.fire({
        title: "Not Logged In",
        text: "Please login to place a bid",
        icon: "warning",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    const bidAmount = Number(bidPerPixel) * activeAuctionZone.totalPixels;

    if (Number(bidPerPixel) < nextBidPerPixel) {
      Swal.fire({
        title: "Bid Too Low",
        text: `Your bid must be at least $${nextBidPerPixel.toFixed(2)} per pixel`,
        icon: "error",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId: activeAuctionZone._id,
          bidAmount,
          bidPerPixel: Number(bidPerPixel),
          pixelCount: activeAuctionZone.totalPixels,
        }),
      });

      const data = await response.json();

      if (response.ok) {

        Swal.fire({
          title: "Bid Placed!",
          text: `Your bid of $${Number(bidPerPixel).toFixed(2)} per pixel was successful`,
          icon: "success",
          confirmButtonColor: "#4f46e5",
        });

        const newBid = {
          ...data.bid,
          userId,
          createdAt: new Date().toISOString(),
          bidIndex: data.bidIndex,
          winStatus: false,
          resultTime: Date.now() + (config?.auctionWinDays || 2) * 24 * 60 * 60 * 1000,
        };

        onNewBid(newBid);
        setBidPerPixel(Number(bidPerPixel) + 1);
      } else {
        throw new Error(data.error || "Failed to place bid");
      }
    } catch (error: any) {
      setMessage(error.message || "Error placing bid");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Place Your Bid</h2>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            <span className="text-blue-800 font-medium">Current Bid:</span>
            <span className="text-lg font-bold text-blue-700 block">
              {hasBids
                ? `$${currentBidPerPixel.toFixed(2)}/pixel`
                : "No bids yet"}
            </span>
          </div>
          <div>
            <span className="text-blue-800 font-medium">Minimum Next Bid:</span>
            <span className="text-lg font-bold text-blue-700 block">
              ${nextBidPerPixel.toFixed(2)}/pixel
            </span>
          </div>
          <div>
            <span className="text-blue-800 font-medium">Total Pixels:</span>
            <span className="text-lg font-bold text-blue-700 block">
              {activeAuctionZone?.totalPixels || 0}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Bid Per Pixel ($)
          </label>
          <input
            type="number"
            value={bidPerPixel}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBidPerPixel(val < minimumAllowedPerPixel ? minimumAllowedPerPixel : val);
            }}
            min={nextBidPerPixel}
            step="1"
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            Total Bid: $
            {(Number(bidPerPixel) * activeAuctionZone.totalPixels).toFixed(2)}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
        >
          {loading ? "Placing Bid..." : "Place Bid Now"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-red-600 text-center">{message}</p>
      )}
    </div>
  );
}
  