
"use client";
import { useState, useEffect } from "react";
import FrontendLayout from "./layouts/FrontendLayout";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState(3600); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);



  return (
    <FrontendLayout>
      <Header/>
      <div className="main-banner" id="top">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-6">
              <div className="left-content">
                <div className="thumb">
                  <div className="inner-content">
                    <h4>Live Auctions</h4>
                    <span>Time Left: {Math.floor(timeLeft / 60)} min {timeLeft % 60} sec</span>
                    <div className="main-border-button">    
                      <a href="#">Start Bidding</a>
                    </div>
                  </div>
                  <Image src="/assets/images/auction.jpg" alt="Live Auction" width={500} height={490} />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="right-content">
                <div className="row">
                  <div className="col-lg-6" >
                    <div className="right-first-image">
                      <div className="thumb">
                        <div className="inner-content">
                          <h4>AI</h4>
                          <span>Rare and valuable pieces</span>
                        </div>
                        <div className="hover-content">
                          <div className="inner">
                            <h4>Art</h4>
                            <p>Exclusive art auctions available now.</p>
                            <div className="main-border-button">
                              <a href="#">View Auctions</a>
                            </div>
                          </div>
                        </div>
                        <Image src="/assets/images/ai.jpg" alt="Auction Art" width={230} height={230} />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="right-first-image">
                      <div className="thumb">
                        <div className="inner-content">
                          <h4>Cars</h4>
                          <span>Luxury & classic vehicles</span>
                        </div>
                        <div className="hover-content">
                          <div className="inner">
                            <h4>Cars</h4>
                            <p>Bid on rare and exotic vehicles.</p>
                            <div className="main-border-button">
                              <a href="#">View Auctions</a>
                            </div>
                          </div>
                        </div>
                        <Image src="/assets/images/cars.jpg" alt="Auction Cars"  width={230} height={230}/>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="right-first-image">
                      <div className="thumb">
                        <div className="inner-content">
                          <h4>Watches</h4>
                          <span>Exclusive luxury timepieces</span>
                        </div>
                        <div className="hover-content">
                          <div className="inner">
                            <h4>Watches</h4>
                            <p>Collectible and high-value watches.</p>
                            <div className="main-border-button">
                              <a href="#">View Auctions</a>
                            </div>
                          </div>
                        </div>
                        <Image src="/assets/images/baner-right-image-03.jpg" alt="Auction Watches"  width={230} height={230}/>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="right-first-image">
                      <div className="thumb">
                        <div className="inner-content">
                          <h4>Jewelry</h4>
                          <span>Exclusive high-end pieces</span>
                        </div>
                        <div className="hover-content">
                          <div className="inner">
                            <h4>Jewelry</h4>
                            <p>Rare and valuable jewelry auctions.</p>
                            <div className="main-border-button">
                              <a href="#">View Auctions</a>
                            </div>
                          </div>
                        </div>
                        <Image src="/assets/images/baner-right-image-04.jpg" alt="Auction Jewelry"  width={230} height={230}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </FrontendLayout>
  );
}
