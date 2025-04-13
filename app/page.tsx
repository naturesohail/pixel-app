"use client";
import { useState, useEffect } from "react";
import FrontendLayout from "./layouts/FrontendLayout";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Spinner } from "./utills/Spinner";
import AuctionCard from "./components/AuctionCard";

interface PixelDataResponse {
  success: boolean;
  config?: {
    _id: string;
    pricePerPixel: number;
    oneTimePrice: number;
    totalPixels: number;
    availablePixels: number;
    createdAt: string;
  };
  products?: {
    _id: string;
    title: string;
    images: string[];
    pixelIndex: number;
    pixelCount: number;
  }[];
}

export default function HomePage() {
  const [pixelData, setPixelData] = useState<{
    config: {
      totalPixels: number;
      availablePixels: number;
    };
    products: {
      _id: string;
      title: string;
      images: string[];
      pixelIndex: number;
      pixelCount: number;
    }[];
  } | null>(null);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPixelData() {
      try {
        const response = await fetch("/api/pixels");
        const data: PixelDataResponse = await response.json();
        if (data.success && data.config) {
          setPixelData({
            config: {
              totalPixels: data.config.totalPixels,
              availablePixels: data.config.availablePixels
            },
            products: data.products?.map(p => ({
              _id: p._id,
              title: p.title,
              images: p.images,
              pixelIndex: p.pixelIndex,
              pixelCount: p.pixelCount
            })) || []
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching pixel data:", error);
        setIsLoading(false);
      }
    }
    fetchPixelData();
  }, []);

  return (
    <FrontendLayout>
      <Header />
      <div className="main-banner" id="top">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="container">
                {loading ? (
                  <Spinner />
                ) : pixelData ? (
                  <div className="row">
                    <AuctionCard
                      config={pixelData.config}
                      products={pixelData.products}
                    />
                  </div>
                ) : (
                  <p className="text-center text-white w-full">
                    No pixel data available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </FrontendLayout>
  );
}