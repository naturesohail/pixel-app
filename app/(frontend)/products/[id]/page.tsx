"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FrontendLayout from "@/app/layouts/FrontendLayout";
import Image from "next/image";
import { Product } from "@/app/types/productTypes";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51R7u7XFWt2YrxyZwQ7kODs2zn8kBC3rbqOf8bU4JfAvtyyWpd96TYtikYji8oyP04uClsnEqxlg0ApdiImX4Xhtm00NGDkbha9");

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [boxSize, setBoxSize] = useState(10);   
    const [isProcessing, setIsProcessing] = useState(false);

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
        if (boxSize < 50) setBoxSize((prev) => prev + 10);
    };

    const decreaseSize = () => {
        if (boxSize > 10) setBoxSize((prev) => prev - 10);
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
                                        <button onClick={handleBuyNow} disabled={isProcessing}>
                                            {isProcessing ? "Processing..." : product?.auctionType === "bidding" ? "Bid Now" : "Buy Now"}
                                        </button>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 mt-4">
                                        <button className="btn btn-sm btn-secondary" onClick={decreaseSize}>-</button>
                                        <span className="pb-4">Zoom</span>
                                        <button className="btn btn-sm btn-secondary" onClick={increaseSize}>+</button>
                                    </div>

                                    <p className="d-flex flex-wrap gap-2 mt-3">
                                        {Array.from({ length: Number(product?.totalPixel) || 0 }).map((_, index) => (
                                            <span
                                                key={index}
                                                className="d-inline-block border border-dark bg-light"
                                                style={{ width: `${boxSize}px`, height: `${boxSize}px` }}
                                            ></span>
                                        ))}
                                    </p>
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
