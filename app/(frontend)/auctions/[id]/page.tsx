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
import Image from "next/image";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    title: "",
    images: [] as string[],
    url: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

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

  const openPaymentModal = (bid: any) => {
    setSelectedBid(bid);
    setShowPaymentModal(true);
    setProductForm({
      title: "",
      images: [],
      url: ""
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages: string[] = [];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setProductForm(prev => ({
                ...prev,
                images: [...prev.images, ...newImages],
              }));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handlePayment = async () => {
    if (!userId || !selectedBid || !activeAuctionZone) {
      Swal.fire({
        title: "Error",
        text: "Missing required information",
        icon: "error",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        userId,
        bidId: selectedBid._id,
        zoneId: activeAuctionZone._id,
        bidAmount: selectedBid.bidAmount,
        pixelCount: activeAuctionZone.totalPixels,
        productData: productForm,
        isWinnerPayment: true
      };

      const response = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      if (data.url) {
        window.location.href = data.url; 
      } else {
        throw new Error("Missing checkout session URL");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      Swal.fire({
        title: "Payment Failed",
        text: error.message || "Something went wrong with your payment",
        icon: "error",
      });
    } finally {
      setIsProcessing(false);
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

              {/* {!auctionEnded && activeAuctionZone?._id && ( */}
                <BidForm
                  config={config}
                  activeAuctionZone={activeAuctionZone}
                  highestBid={highestBid}
                  onNewBid={handleNewBid}
                />
              {/* )} */}
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
                                onClick={() => openPaymentModal(bid)}
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

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Complete Your Payment</h2>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Winning Bid Amount:</span>
                    <span className="font-bold">${selectedBid?.bidAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Total Pixels:</span>
                    <span className="font-bold">{activeAuctionZone?.totalPixels || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price Per Pixel:</span>
                    <span className="font-bold">
                      ${(selectedBid?.bidAmount / activeAuctionZone?.totalPixels).toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Pixel Title*</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={productForm.title}
                    onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                    placeholder="Enter title for your pixel content"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Pixel Image</label>
                  <input
                    type="file"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {productForm.images.map((img, index) => (
                      <div key={index} className="relative w-16 h-16">
                        <Image
                          src={img}
                          alt={`Preview ${index}`}
                          fill
                          className="object-cover rounded"
                        />
                        <button
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block mb-2 font-medium">Pixel URL</label>
                  <input
                    type="url"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={productForm.url}
                    onChange={(e) => setProductForm({...productForm, url: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                    isProcessing || !productForm.title 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  onClick={handlePayment}
                  disabled={isProcessing || !productForm.title}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </FrontendLayout>
  );
}