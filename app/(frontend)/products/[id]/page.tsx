"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FrontendLayout from "@/app/layouts/FrontendLayout";
import Image from "next/image";
import { Product } from "@/app/types/productTypes";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/app/context/AuthContext";

const stripePromise = loadStripe("pk_test_51R7u7XFWt2YrxyZwQ7kODs2zn8kBC3rbqOf8bU4JfAvtyyWpd96TYtikYji8oyP04uClsnEqxlg0ApdiImX4Xhtm00NGDkbha9");

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [boxSize, setBoxSize] = useState(7);
    const [isProcessing, setIsProcessing] = useState(false);
    const pixelsPerPage = 100;
    const [pixelPageMap, setPixelPageMap] = useState<{ [key: string]: number }>({});
    const [showBidDropdown, setShowBidDropdown] = useState(false);
    const [bidPixels, setBidPixels] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch product");
                }
                const data: Product = await response.json();
                setProduct(data);
            } catch (error) {
                setError("Error fetching product details");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const increaseSize = () => {
        if (boxSize < 15) setBoxSize((prev) => prev + 1);
    };

    const decreaseSize = () => {
        if (boxSize > 5) setBoxSize((prev) => prev - 1);
    };

    const handleBuyNow = async () => {
        if (!product) return;
        setIsProcessing(true);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [
                        {
                            name: product.productName,
                            price: product.price,
                            quantity: 1,
                        },
                    ],
                    successUrl: `${window.location.origin}/success`,
                    cancelUrl: `${window.location.origin}/cancel`,
                }),
            });

            const { sessionId } = await response.json();
            const stripe = await stripePromise;
            if (stripe) await stripe.redirectToCheckout({ sessionId });

        } catch (error) {
            console.error("Checkout error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!product || !user) return;
        const bidValue = parseInt(bidPixels, 10);

        if (!bidValue || bidValue <= 0 || bidValue > product?.totalPixel) {
            alert("Enter a valid number of pixels within the available range.");
            return;
        }

        setIsProcessing(true);

        try {
            const response = await fetch("/api/bids", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?._id,
                    productId: product._id,
                    totalPixels: bidValue,
                    bidAmount: bidValue * product?.price,
                    status: "pending",
                    createdAt: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error("Failed to place bid");

            alert(`Bid placed for ${bidValue} pixels!`);
            setShowBidDropdown(false);
            setBidPixels("");
        } catch (error) {
            console.error("Bid error:", error);
            alert("Error placing bid. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };


    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!product) return <p>Product not found</p>;

    return (
        <FrontendLayout>
            <Header />
            <div className="page-heading about-page-heading" id="top"></div>

            <section className="section" id="product">
                <div className="container" style={{ marginTop: "140px !important" }}>
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="left-images">
                                <Image src={product?.image} alt={product.productName} width={400} height={400} />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="right-content">
                                <h4>{product.productName}</h4>
                                <span>{product?.totalPixel} pixels available</span>
                                <div className="total">
                                    <h4>{product?.auctionType === "bidding" ? "Highest Bidding" : "Price"}: ${product.price}</h4>
                                    <div className="main-border-button">
                                        {product?.auctionType === "bidding" ? (
                                            <>
                                                <button onClick={() => setShowBidDropdown(!showBidDropdown)} disabled={isProcessing}>
                                                    {isProcessing ? "Processing..." : "Bid Now"}
                                                </button>

                                                {showBidDropdown && (
                                                    <div className="bid-dropdown">
                                                        <input
                                                            type="number"
                                                            placeholder="Enter pixels to bid"
                                                            value={bidPixels}
                                                            onChange={(e) => setBidPixels(e.target.value)}
                                                            min="1"
                                                            max={product.totalPixel}
                                                            className="form-control mt-5 w-50"
                                                        />
                                                        <button onClick={handlePlaceBid} className="btn btn-secondary mt-3">Place Bid</button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <button onClick={handleBuyNow} disabled={isProcessing}>
                                                {isProcessing ? "Processing..." : "Buy Now"}
                                            </button>
                                        )}
                                    </div>

                                    <div className="d-flex align-items-center gap-2 mt-4">
                                        <button className="btn btn-sm btn-secondary" onClick={decreaseSize}>-</button>
                                        <span className="pb-4">Zoom</span>
                                        <button className="btn btn-sm btn-secondary" onClick={increaseSize}>+</button>
                                    </div>

                                    <p className="d-flex flex-wrap gap-2 mt-3">
                                        <div
                                            style={{
                                                width: "800px",
                                                height: "300px",
                                                display: "grid",
                                                gridTemplateColumns: `repeat(${Math.floor(720 / boxSize)}, ${boxSize}px)`,
                                                gridTemplateRows: `repeat(${Math.floor(630 / boxSize)}, ${boxSize}px)`,
                                                gap: "0px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {Array.from({ length: product?.totalPixel + product?.pixelBid }).map((_, index) => {
                                            const isBooked = index < product.pixelBid;
                                                return (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            width: `${boxSize}px`,
                                                            height: `${boxSize}px`,
                                                            backgroundColor: isBooked ? "grey" : "#ffffff",
                                                            border: "0.5px solid #999",
                                                        }}
                                                    ></div>
                                                );
                                            })}
                                        </div>
                                    </p>


                                    <div className="d-flex mt-4 gap-2">
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => setPixelPageMap((prev) => ({ ...prev, [product._id]: Math.max(0, (prev[product._id] || 0) - 1) }))}
                                            disabled={(pixelPageMap[product._id] || 0) === 0}>
                                            Prev
                                        </button>
                                        <span>{(pixelPageMap[product._id] || 0) + 1}/{Math.ceil(product.totalPixel / pixelsPerPage)}</span>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => setPixelPageMap((prev) => ({ ...prev, [product._id]: (prev[product._id] || 0) + 1 }))}
                                            disabled={(pixelPageMap[product._id] || 0) * pixelsPerPage + pixelsPerPage >= product.totalPixel}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </FrontendLayout>
    );
}
