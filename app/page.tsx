"use client";
import { useState, useEffect } from "react";
import FrontendLayout from "./layouts/FrontendLayout";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import { Product } from "./types/productTypes";

export default function HomePage() {
  const [auctionItems, setAuctionItems] = useState<Product[]>([]);
  const [timeLeftMap, setTimeLeftMap] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function fetchAuctionItems() {
      try {
        const response = await fetch("/api/products");
        let data: Product[] = await response.json();

        // Filter out expired auctions
        const now = Date.now();
        data = data.filter((item) => new Date(item.biddingEndTime).getTime() > now);

        // Limit to 4 active products
        data = data.slice(0, 4);
        setAuctionItems(data);

        // Initialize timeLeft for each product
        const newTimeLeftMap: { [key: string]: number } = {};
        data.forEach((item) => {
          const endTime = new Date(item.biddingEndTime).getTime();
          newTimeLeftMap[item._id] = Math.max(0, Math.floor((endTime - now) / 1000));
        });
        setTimeLeftMap(newTimeLeftMap);
      } catch (error) {
        console.error("Error fetching auction items:", error);
      }
    }
    fetchAuctionItems();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftMap((prevTimeLeft) => {
        const updatedTimeLeft: { [key: string]: number } = {};
        auctionItems.forEach((item) => {
          const newTime = Math.max(0, prevTimeLeft[item._id] - 1);
          updatedTimeLeft[item._id] = newTime;
        });
        return updatedTimeLeft;
      });

      // Remove expired products
      setAuctionItems((prevItems) =>
        prevItems.filter((item) => timeLeftMap[item._id] > 0)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [auctionItems]);

  // Function to format time in Days, Hours, Minutes, and Seconds
  function formatTime(seconds: number): string {
    if (seconds <= 0) return "Auction Ended";
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${secs}s`;
  }

  return (
    <FrontendLayout>
      <Header />
      <div className="main-banner" id="top">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-6">
              <div className="left-content">
                <div className="thumb">
                  <div className="inner-content">
                    <h4>Live Auctions</h4>
                    <div className="main-border-button">
                      <a href="#">View More</a>
                    </div>
                  </div>
                  <Image src="/assets/images/auction.jpg" alt="Live Auction" width={500} height={450} style={{ maxHeight: "580px" }} />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="right-content">
                <div className="row">
                  {auctionItems.map((item) => (
                    <div key={item._id} className="col-lg-6">
                      <div className="right-first-image">
                        <div className="thumb">
                          <div className="inner-content">
                            <h4>{item.productName}</h4>
                            <span>{item.description}</span>
                            <p className="text-white font-bold">
                              Time Left: {formatTime(timeLeftMap[item._id])}
                            </p>
                            <div className="main-border-button">
                      <a href="#">Start Bidding</a>
                    </div>
                          </div>
                          <div className="hover-content">
                            <div className="inner">
                              <h4>{item.productName}</h4>
                              <p>{item.description}</p>
                              <div className="main-border-button">
                                <a href={`products/`+item._id}>View Auctions</a>
                              </div>
                            </div>
                          </div>
                          <Image src={item.image} alt={item.productName} width={260} height={200} className="image-container" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {auctionItems.length === 0 && (
                    <p className="text-center text-white w-full">No active auctions at the moment.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </FrontendLayout>
  );
}
