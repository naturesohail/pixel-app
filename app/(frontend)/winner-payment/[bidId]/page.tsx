"use client";
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FrontendLayout from "@/app/layouts/FrontendLayout";
import Image from "next/image";
import Swal from "sweetalert2";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface ProductForm {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  url?: string;
}

export default function WinnerPaymentPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>({
    title: "",
    description: "",
    price: 0,
    category: "",
    images: [],
  });
  
  const searchParams = useSearchParams();
  const params = useParams();
  const bidId = Array.isArray(params?.bidId) ? params.bidId[0] : params?.bidId;
  const zoneId = searchParams.get('zoneId');
  const bidAmount = parseFloat(searchParams.get('bidAmount') || "0");
  
  const [auctionZone, setAuctionZone] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!bidId || !zoneId || !bidAmount) {
        Swal.fire({
          title: "Invalid Payment Request",
          text: "Missing required payment information",
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
        await fetchAuctionZone();
      } catch (err) {
        console.error("Authentication error:", err);
        Swal.fire({
          title: "Login Required",
          text: "You need to log in to complete payment",
          icon: "warning",
          confirmButtonColor: "#4f46e5",
          confirmButtonText: "Go to Login",
        }).then(() => router.push("/login"));
      }
    };

    checkAuthAndFetchData();
  }, [bidId, zoneId, bidAmount, router]);

  const fetchAuctionZone = async () => {
    try {
      const res = await fetch(`/api/pixels/bid/zone?zoneId=${zoneId}`);
      if (!res.ok) throw new Error('Failed to fetch zone data');
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Zone not found');
      
      setAuctionZone(data.zone);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
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

  const handlePayment = async () => {
    if (!userId || !auctionZone || !bidId) {
      Swal.fire({
        title: "Error",
        text: "Missing required information",
        icon: "error",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          bidId,
          zoneId: auctionZone._id,
          amount: bidAmount,
          pixelCount: auctionZone.totalPixels,
          productData: productForm,
          isWinnerPayment: true
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
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
        text: error.message || "Something went wrong",
        icon: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <FrontendLayout>
        <Header />
        <div className="container py-5 text-center">Loading payment details...</div>
        <Footer />
      </FrontendLayout>
    );
  }

  if (error) {
    return (
      <FrontendLayout>
        <Header />
        <div className="container py-5">
          <div className="alert alert-danger">{error}</div>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => router.push('/')}
          >
            Go Home
          </button>
        </div>
        <Footer />
      </FrontendLayout>
    );
  }

  return (
    <FrontendLayout>
      <Header />
      <div className="container mt-5 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Complete Your Winning Bid Payment</h1>
          {userId && (
            <button
              className="btn btn-outline-primary"
              onClick={() => router.push("/dashboard")}
            >
              My Dashboard
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
                  {/* <div className="text-center mt-2">
                    <small>Auction Zone: {auctionZone.name}</small>
                  </div> */}
                </div>
              </div>
              <div className="col-md-6">
                <div className="alert alert-success mb-4">
                  <h3 className="mb-3">Winning Bid</h3>
                  <div className="d-flex justify-content-between">
                    <span>Your Winning Bid Amount:</span>
                    <strong>${bidAmount.toFixed(2)}</strong>
                  </div>
                 
                </div>
              </div>
            </div>

            <div className="border-top pt-4 mt-4">
              <h3 className="mb-4">Upload Pixel Details</h3>
              <form>
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
                    value={productForm.url || ""}
                    onChange={(e) =>
                      setProductForm({ ...productForm, url: e.target.value })
                    }
                  />
                </div>
                
                <div className="d-grid">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handlePayment}
                    disabled={
                      isProcessing ||
                      !productForm.title 
                    }
                  >
                    {isProcessing ? "Processing Payment..." : "Complete Payment Now"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </FrontendLayout>
  );
}