"use client";

import { useEffect, useState } from "react";
import BidForm from "./bidForm";
import ZoneBidsList from "./bidList";
import Swal from "sweetalert2";
import { useRouter, useParams } from "next/navigation";

export default function PixelMarketplace() {
  const params = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyBided, setAlreadyBided] = useState(false);
  const [activeAuctionZone, setActiveAuctionZone] = useState<any>({});
  const [config, setConfig] = useState<any>(null);
  const router = useRouter();
  
  // Safely get zoneId from params
  const zoneId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  useEffect(() => {
    // Check if we have a valid zone ID
    if (!zoneId) {
      Swal.fire({
        title: "Invalid Auction Zone",
        text: "No auction zone specified",
        icon: "error",
        confirmButtonColor: "#4f46e5",
        confirmButtonText: "Go Home",
      }).then(() => router.push("/"));
      return;
    }

    // Get user ID from localStorage
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserId(parsed?._id || null);
      } catch (err) {
        console.error("Failed to parse userData:", err);
      }
    }

    // Fetch auction data
    async function fetchPixelData() {
      try {
        setLoading(true);
        const response = await fetch("/api/pixels");
        
        if (!response.ok) {
          throw new Error("Failed to fetch pixel data");
        }
        
        const data = await response.json();

        if (data.success && data.config) {
          setConfig(data.config);
          
          // Find the active auction zone
          const auctionZones = data.config.auctionZones || [];
          const activezone = auctionZones.find((zone: any) => zone._id === zoneId);
          
          if (!activezone) {
            Swal.fire({
              title: "Auction Not Found",
              text: "The auction zone you're looking for doesn't exist",
              icon: "warning",
              confirmButtonColor: "#4f46e5",
              confirmButtonText: "Browse Auctions",
            }).then(() => router.push("/auctions"));
            return;
          }
          
          setActiveAuctionZone(activezone);
        }
      } catch (error) {
        console.error("Error fetching pixel data:", error);
        Swal.fire({
          title: "Network Error",
          text: "Failed to load auction data. Please try again later.",
          icon: "error",
          confirmButtonColor: "#4f46e5",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPixelData();
  }, [zoneId, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auction data...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {activeAuctionZone?.name || "Auction Zone"}
            </h1>
            <p className="text-gray-600 mb-4">
              {activeAuctionZone?.isEmpty 
                ? "Empty pixel zone" 
                : `Products: ${activeAuctionZone?.products?.title || "No products"}`}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Zone Details</h2>
                <p className="mb-1">
                  <span className="font-medium">Size:</span> {activeAuctionZone?.width || 0}x{activeAuctionZone?.height || 0} pixels
                </p>
                <p className="mb-1">
                  <span className="font-medium">Total Pixels:</span> {activeAuctionZone?.totalPixels || 0}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Status:</span> {activeAuctionZone?.status || "Unknown"}
                </p>
                {activeAuctionZone?.auctionEndDate && (
                  <p>
                    <span className="font-medium">Ends:</span> {new Date(activeAuctionZone.auctionEndDate).toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-800 mb-2">Pricing</h2>
                <p className="mb-1">
                  <span className="font-medium">Bid Price Per Pixel:</span> ${activeAuctionZone?.pixelPrice?.toFixed(2) || "0.00"}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Instant Buy Price:</span> ${activeAuctionZone?.buyNowPrice?.toFixed(2) || "0.00"}
                </p>
                <p className="font-medium">
                  Total Instant Price: ${(activeAuctionZone?.totalPixels * activeAuctionZone?.buyNowPrice).toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
          
          {zoneId && (
            <ZoneBidsList
              userId={userId}
              zoneId={zoneId}
              setAlreadyBided={setAlreadyBided}
            />
          )}

          {!alreadyBided && activeAuctionZone?._id && (
            <BidForm config={config} activeAuctionZone={activeAuctionZone} />
          )}
        </>
      )}
    </div>
  );
}