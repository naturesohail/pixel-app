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
  purchaseType?: 'one-time' | 'bid';
}
interface PixelGrid {
  totalPixels: number;
  availablePixels: number;
  pricePerPixel: number;
  oneTimePrice: number;
}

export default function PixelMarketplace() {
  const router = useRouter();
  const { user } = useAuth();

  const [pixelGrid, setPixelGrid] = useState<PixelGrid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixelCount, setPixelCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"bid" | "buy">("buy");

  const [productForm, setProductForm] = useState<Product>({
    title: "",
    description: "",
    price: 0,
    category: "",
    images: [],
    url: ""
  });

  const DEFAULT_PRICES = {
    bidPrice: 1.00,
    buyPrice: 1.50
  };

  const getCurrentPrices = () => {
    if (!pixelGrid) return DEFAULT_PRICES;
    return {
      bidPrice: pixelGrid.pricePerPixel || DEFAULT_PRICES.bidPrice,
      buyPrice: pixelGrid.oneTimePrice || DEFAULT_PRICES.buyPrice
    };
  };

  const { bidPrice, buyPrice } = getCurrentPrices();
  const currentPricePerPixel = actionType === "buy" ? buyPrice : bidPrice;
  const totalPrice = pixelCount * currentPricePerPixel;
  const maxPixels = pixelGrid?.availablePixels || 1000;

  useEffect(() => {
    const fetchPixelGrid = async () => {
      try {
        const response = await fetch(`/api/pixels`);
        if (!response.ok) throw new Error("Failed to fetch pixel grid");
        const data = await response.json();
        setPixelGrid(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error fetching pixel grid");
      } finally {
        setLoading(false);
      }
    };

    fetchPixelGrid();
  }, []);

  

  const handleActionClick = (type: "bid" | "buy") => {
    setActionType(type);
    setShowActionModal(true);
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    try {
      const stripe = await stripePromise;
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          pixelCount,
          totalPrice,
          productData: productForm,
          isOneTimePurchase: true
        })
      });

      const session = await response.json();
      await stripe?.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!user || !pixelGrid) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/pixels/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          pixelCount,
          totalPrice,
          product: productForm,
          isOneTimePurchase: false
        })
      });

      if (!response.ok) throw new Error("Bid placement failed");

      const updatedGrid = await response.json();
      setPixelGrid(updatedGrid);
      setShowActionModal(false);
      alert("Bid placed successfully!");
    } catch (error) {
      console.error("Bid error:", error);
      alert(error instanceof Error ? error.message : "Bid placement failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages: string[] = [];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setProductForm(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
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
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (loading) return (
    <FrontendLayout>
      <Header />
      <div className="container py-5 text-center">Loading pixel grid...</div>
      <Footer />
    </FrontendLayout>
  );

  if (error) return (
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
          <h1>Pixel Marketplace</h1>
          <div className="d-flex align-items-center">
            <span className="me-3">
              Price per pixel: ${bidPrice.toFixed(2)} (Bid) / ${buyPrice.toFixed(2)} (Buy)
            </span>
            {user && (
              <button
                className="btn btn-outline-primary"
                onClick={() => router.push("/dashboard")}
              >
                My Pixels
              </button>
            )}
          </div>
        </div>

        <div className="card mb-4 mt-5">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title mb-0">Purchase Pixels</h5>
                <small className="text-muted">
                  {pixelGrid ? `${pixelGrid.totalPixels - pixelGrid.availablePixels} pixels occupied, ${pixelGrid.availablePixels} available` : 'Loading pixel data...'}
                </small>
              </div>
            </div>
          </div>
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
                      margin: "0 auto"
                    }}
                  />
                  <div className="text-center mt-2">
                    <small>Selected: {pixelCount} pixel{pixelCount !== 1 ? 's' : ''}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
               

                <div className="alert alert-info mb-4">
                  <div className="d-flex justify-content-between">
                    <span>Current Price ({actionType === "buy" ? "One-Time" : "Bid"}):</span>
                    <strong>${totalPrice.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Price per pixel:</span>
                    <strong>${currentPricePerPixel.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="d-grid gap-5">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleActionClick("buy")}
                    disabled={isProcessing}
                  >
                    Buy Now (${buyPrice.toFixed(2)}/pixel)
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleActionClick("bid")}
                    disabled={isProcessing}
                  >
                    Place Bid (${bidPrice.toFixed(2)}/pixel)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showActionModal && (
        <div className="modal show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {actionType === "buy" ? "Buy Pixels" : "Place Bid for Pixels"}
                </h5>
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
                      <strong>${currentPricePerPixel.toFixed(2)}</strong>
                        <span>Number of pixels:</span>
                      <strong>{pixelCount}</strong>
                    </div>
                   
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Product Title*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={productForm.title}
                      onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Product Images</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="d-flex flex-wrap mt-2 gap-2">
                      {productForm.images.map((img, i) => (
                        <div key={i} style={{ width: "80px", height: "80px", position: "relative" }}>
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
                              fontSize: "0.6rem"
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
                    <label className="form-label">Product URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={productForm.url}
                      onChange={(e) => setProductForm({...productForm, url: e.target.value})}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description*</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      required
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
                  onClick={actionType === "buy" ? handleBuyNow : handlePlaceBid}
                  disabled={isProcessing || !productForm.title || !productForm.description}
                >
                  {isProcessing ? "Processing..." : actionType === "buy" ? "Confirm Purchase" : "Place Bid"}
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