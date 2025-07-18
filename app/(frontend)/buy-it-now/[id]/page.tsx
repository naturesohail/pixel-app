"use client";
const stripePromise = loadStripe("pk_test_51R7u7XFWt2YrxyZwQ7kODs2zn8kBC3rbqOf8bU4JfAvtyyWpd96TYtikYji8oyP04uClsnEqxlg0ApdiImX4Xhtm00NGDkbha9");
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FrontendLayout from "@/app/layouts/FrontendLayout";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import { useParams } from 'next/navigation';

interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  url?: string;
  ownerId?: string;
  pixelIndex?: number;
  expiryDate?: string;
  pixelCount?: number;
  purchaseType?: "one-time" | "bid";
}

interface PixelGrid {
  totalPixels: number;
  availablePixels: number;
  pricePerPixel: number;
  oneTimePrice: number;
  config: {
    minimumOrderQuantity: number;
    availablePixels: number;
    oneTimePrice: number;
    pricePerPixel: number;
    auctionZones: any[];
  };
}


export default function BuyItNowPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [pixelGrid, setPixelGrid] = useState<PixelGrid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixelCount, setPixelCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [bidData, setBidData] = useState<any>(null);
  const [activeAuctionZone, setActiveAuctionZone] = useState<any>(null);
  const [productForm, setProductForm] = useState<Product>({
    title: "",
    description: "",
    price: 0,
    category: "",
    images: [],
    url: "",
  });
  const params = useParams();
  ;
  const zoneId =   params?.id
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData?._id || null);
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }
  }, []);


// console.log('activeAuctionZone :>> ', activeAuctionZone);
 
useEffect(() => {
    if (userId === null && typeof window !== "undefined") return;

    const fetchPixelGrid = async () => {
      try {
        const response = await fetch(`/api/pixels`);
        if (!response.ok) throw new Error("Failed to fetch pixel grid");
        const data = await response.json();
        const activeZone = data.config.auctionZones.find(
          (z: any) => z._id === zoneId
        );
        
        if (!activeZone) {
          Swal.fire({
            title: "No pixels available to buy",
            text: "",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4f46e5",
            cancelButtonColor: "#d33",
            confirmButtonText: "ok",
          }).then((result) => {
            router.push("/");
          });
          return;
        }
        
        setActiveAuctionZone(activeZone);
        
        if (userId) {
          const bid = data.config.auctionZones.find((z: any) => z.status)?.bids.find((bid: any) => bid.winStatus && bid.userId === userId);
          setBidData(bid);
        }
        
        setPixelGrid(data);
        setPixelCount(data.config.minimumOrderQuantity || 1);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Error fetching pixel grid"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPixelGrid();

  }, [userId]);

  const incrementCount = () => {
    if (pixelGrid && pixelCount < pixelGrid.config.availablePixels) {
      setPixelCount(pixelCount + 1);
    }
  };

  const decrementCount = () => {
    if (pixelGrid && pixelCount > pixelGrid.config.minimumOrderQuantity) {
      setPixelCount(pixelCount - 1);
    }
  };

  const totalPrice =
    activeAuctionZone?.totalPixels * (activeAuctionZone?.buyNowPrice || 0);
  const totalPriceBid =
    activeAuctionZone?.totalPixels * (bidData?.bidAmount || 0);

  const showLoginAlert = () => {
    Swal.fire({
      title: "Login Required",
      text: "You need to login to perform this action",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: "Login Now",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/login");
      }
    });
  };

  const handleBuyClick = () => {
    if (!isLoggedIn) {
      showLoginAlert();
      return;
    }
    setShowActionModal(true);
  };
  
 const handleBuyNow = async () => {
  if (!user || !pixelGrid) {
    showLoginAlert();
    return;
  }

  setIsProcessing(true);
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        pixelCount,
        totalPrice: totalPriceBid || totalPrice,
        productData: productForm,
        isOneTimePurchase: true,
        targetZoneId: zoneId
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Redirect to Stripe Checkout
    if (data.id) {
      window.location.href = data.url; // This should be the checkout URL
    } else {
      throw new Error("Missing checkout session URL");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    Swal.fire({
      title: "Checkout Failed",
      text: error instanceof Error ? error.message : "Something went wrong",
      icon: "error",
    });
  } finally {
    setIsProcessing(false);
  }
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
              setProductForm((prev) => ({
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
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (loading)
    return (
      <FrontendLayout>
        <Header />
        <div className="container py-5 text-center">Loading pixel grid...</div>
        <Footer />
      </FrontendLayout>
    );

  if (error)
    return (
      <FrontendLayout>
        <Header />
        <div className="container py-5">
          <div className="alert alert-danger">{error}</div>
        </div>
        <Footer />
      </FrontendLayout>
    );

  return (
    <FrontendLayout>
      <Header />

      <div className="container mt-5 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Buy Pixels Now</h1>
          {user && (
            <button
              className="btn btn-outline-primary"
              onClick={() => router.push("/dashboard")}
            >
              My Pixels
            </button>
          )}
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="pixel-visualization mb-4">
                  <div
                    className="pixel-box"
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: "#f0f0f0",
                      border: "1px solid #ddd",
                      margin: "0 auto",
                    }}
                  />
                  <div className="text-center mt-2">
                    <small>
                      Selected: {pixelCount} pixel{pixelCount !== 1 ? "s" : ""}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-4">
                  <label className="form-label">Number of pixels:</label>
                  <div className="d-flex align-items-center">
                   
                    <div
                      className="mx-2"
                      style={{ width: "80px", textAlign: "center" }}
                    >
                      {
                        pixelGrid?.config.auctionZones[
                          pixelGrid?.config.auctionZones.length - 1
                        ].totalPixels
                      }
                    </div>
                  
                  </div>
                 
                </div>

                <div className="alert alert-info mb-4">
                  <div className="d-flex justify-content-between">
                    <span>Price per pixel:</span>
                    <strong>${activeAuctionZone?.buyNowPrice}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Price:</span>
                    {totalPriceBid ? (
                      <>
                        {" "}
                        <span style={{ textDecoration: "line-through" }}>
                          ${totalPrice}
                        </span>
                        <strong>${totalPriceBid.toFixed(2)}</strong>
                      </>
                    ) : (
                      <span> ${totalPrice}</span>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={handleBuyClick}
                  disabled={isProcessing}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showActionModal && (
        <div
          className="modal show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Pixel Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowActionModal(false)}
                />
              </div>
              <div className="modal-body">
                <form>
                  <div className="alert alert-info mb-1">
                    <div className="d-flex justify-content-between">
                      <span>Total Price:</span>
                      <strong>${totalPrice.toFixed(2)}</strong>
                      <span>Price per pixel:</span>
                      <strong>
                        ${pixelGrid?.config.oneTimePrice?.toFixed(2) || "0.00"}
                      </strong>
                      <span>Number of pixels:</span>
                      <strong>
                        {
                          pixelGrid?.config.auctionZones[
                            pixelGrid?.config.auctionZones.length - 1
                          ].totalPixels
                        }
                      </strong>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Pixel Title*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={productForm.title}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Pixel Images</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="d-flex flex-wrap mt-2 gap-2">
                      {productForm.images.map((img, i) => (
                        <div
                          key={i}
                          style={{
                            width: "80px",
                            height: "80px",
                            position: "relative",
                          }}
                        >
                          <Image
                            src={img}
                            alt={`Product image ${i}`}
                            fill
                            style={{ objectFit: "cover" }}
                            className="rounded"
                          />
                          <button
                            className="btn btn-sm btn-danger"
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              padding: "0.1rem 0.25rem",
                              fontSize: "0.6rem",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              removeImage(i);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Pixel URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={productForm.url}
                      onChange={(e) =>
                        setProductForm({ ...productForm, url: e.target.value })
                      }
                    />
                  </div>

                 
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowActionModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBuyNow}
                  disabled={
                    isProcessing ||
                    !productForm.title 
                  }
                >
                  {isProcessing ? "Processing..." : "Confirm Purchase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      <Footer />
    </FrontendLayout>
  );
}