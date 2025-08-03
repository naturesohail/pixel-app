"use client";
import { useEffect, useState } from "react";
import BidForm from "./bidForm";
import Swal from "sweetalert2";
import { useRouter, useParams } from "next/navigation";
import Countdown from "react-countdown";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import FrontendLayout from "@/app/layouts/FrontendLayout";


export default function PixelMarketplace() {
  const params = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAuctionZone, setActiveAuctionZone] = useState<any>({});
  const [config, setConfig] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [highestBid, setHighestBid] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();

  const zoneId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [auctionEnded, setAuctionEnded] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
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

      try {
        const storedUser = localStorage.getItem("userData");
        if (!storedUser) {
          throw new Error("No user session");
        }

        const parsed = JSON.parse(storedUser);
        if (!parsed?._id) {
          throw new Error("Invalid user session");
        }

        setUserId(parsed._id);
        await fetchPixelData();
      } catch (err) {
        console.error("Authentication error:", err);
        Swal.fire({
          title: "Login Required",
          text: "You need to log in to view this auction",
          icon: "warning",
          confirmButtonColor: "#4f46e5",
          confirmButtonText: "Go to Login",
        }).then(() => router.push("/login"));
      }
    };

    checkAuthAndFetchData();
  }, [zoneId, router]);

  useEffect(() => {
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

    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserId(parsed?._id || null);
      } catch (err) {
        console.error("Failed to parse userData:", err);
      }
    }

    fetchPixelData();
  }, [zoneId, router]);

  useEffect(() => {
    if (activeAuctionZone?.expiryDate) {
      const endTime = new Date(activeAuctionZone.expiryDate).getTime();
      const now = Date.now();
      setAuctionEnded(now > endTime);
    }
  }, [activeAuctionZone]);

  const fetchBids = async () => {
    try {
      const bidRes = await fetch(`/api/pixels/bid/zone?zoneId=${zoneId}`);
      const bidData = await bidRes.json();

      if (bidData.success) {
        setBids(bidData.bids);
        setHighestBid(bidData.highestBid || 0);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  };

  async function fetchPixelData() {
    try {
      setLoading(true);
      const pixelRes = await fetch("/api/pixels");

      if (!pixelRes.ok) {
        throw new Error("Failed to fetch pixel data");
      }

      const pixelData = await pixelRes.json();

      if (pixelData.success && pixelData.config) {
        setConfig(pixelData.config);

        const auctionZones = pixelData.config.auctionZones || [];
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

        if (activezone.expiryDate) {
          const endTime = new Date(activezone.expiryDate).getTime();
          setTimeLeft(endTime - Date.now());
        }

        await fetchBids();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const handleNewBid = (newBid: any) => {
    setBids([newBid, ...bids]);
    setHighestBid(newBid.bidAmount);
  };


  const handlePayment = async (bidId: string) => {
    try {
      const response = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidId,
          zoneId,
          amount: highestBid,
          pixelCount: activeAuctionZone.totalPixels
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create payment session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      Swal.fire({
        title: "Payment Failed",
        text: "Could not initiate payment. Please try again.",
        icon: "error",
        confirmButtonColor: "#4f46e5",
      });
    }
  };

  const renderCountdown = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return <span className="text-red-600 font-bold">Auction Ended</span>;
    }
    return (
      <span className="font-semibold">
        {days}d {hours}h {minutes}m {seconds}s
      </span>
    );
  };

  const userHasBid = userId && bids.some(bid => bid.userId.toString() === userId);

  return (
    <FrontendLayout>
      <Header />
      <div className="container mx-auto px-4 " style={{ marginTop: "88px" }}>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auction data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                      {activeAuctionZone?.name || "Auction Zone"}
                    </h1>
                    <p className="text-gray-600 mb-2">
                      <b>
                        Total Pixels: {activeAuctionZone?.totalPixels || 0}

                      </b>
                    </p>
                    <p className="text-gray-600 mb-2">
                      <b>
                        Size {activeAuctionZone.width} x {activeAuctionZone.height} Pixel

                      </b>
                    </p>
                  </div>

                  {activeAuctionZone?.expiryDate && (
                    <div className="bg-purple-100 px-4 py-2 rounded-lg">
                      <span className="text-red-800 mr-2">Ends in:</span>
                      <Countdown
                        date={Date.now() + timeLeft}
                        renderer={renderCountdown}
                        onComplete={() => setAuctionEnded(true)}
                      />
                    </div>
                  )}
                </div>



                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                    Current Bidding Status
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Highest Bid</p>
                      <p className="text-xl font-bold">${highestBid}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Bids</p>
                      <p className="text-xl font-bold">{bids.length}</p>
                    </div>

                  </div>
                </div>

                {activeAuctionZone?.buyNowPrice && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600">Instant Purchase Price</p>
                        <p className="text-xl font-bold text-green-600">
                          $
                          {(
                            activeAuctionZone.totalPixels *
                            activeAuctionZone.buyNowPrice
                          ).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          (${activeAuctionZone.buyNowPrice.toFixed(2)}/pixel)
                        </p>
                      </div>
                      <Link
                        href={`/buy-it-now/${activeAuctionZone._id}`}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Buy it Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* {!userHasBid && !auctionEnded && activeAuctionZone?._id && ( */}
              {!auctionEnded && activeAuctionZone?._id && (

                <BidForm
                  config={config}
                  activeAuctionZone={activeAuctionZone}
                  highestBid={highestBid}
                  onNewBid={handleNewBid}
                />
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md h-[calc(100vh-120px)] p-6 sticky top-4 flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  All Bids ({bids.length})
                </h2>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {bids.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No bids yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Be the first to place a bid!</p>
                    </div>
                  ) : (
                    bids.map((bid) => (
                      <div
                        key={bid._id}
                        className={`p-4 rounded-lg border ${bid.bidAmount === highestBid
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                          } ${bid.userId === userId ? "ring-2 ring-blue-300" : ""
                          }`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">
                              Bid #{bid.bidIndex}
                              {bid.userId.toString() === userId && (
                                <>
                                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    Your Bid
                                  </span>
                                 
                                </>
                              )}
                               {bid.bidAmount === highestBid && !auctionEnded && (
                                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                      Highest Bid
                                    </span>
                                  )}
                              {auctionEnded &&
                                bid.bidAmount === highestBid && (
                                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    Winner
                                  </span>
                                )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(bid.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${bid.bidAmount}</p>
                            <p className="text-sm text-gray-500">
                              {bid.userId.toString() === userId ? "You" : "Bidder " + bid.userId.toString().slice(-4)}
                            </p>
                          </div>
                        </div>
                        {bid.resultTime && (
                          <p className="text-xs text-gray-500 mt-2">
                            Result at: {new Date(bid.resultTime).toLocaleString()}
                          </p>
                        )}
                        {auctionEnded &&
                          bid.bidAmount === highestBid &&
                          bid.userId.toString() === userId && (
                            <div className="mt-3">
                              <button
                                onClick={() => handlePayment(bid._id)}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                              >
                                Complete Payment
                              </button>
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </FrontendLayout>
  );
}