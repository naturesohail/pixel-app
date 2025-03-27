"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FrontendLayout from "@/app/layouts/FrontendLayout";
import Image from "next/image";
import { Product } from "@/app/types/productTypes";

export default function ProductPage() {
    const { id } = useParams(); 
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [boxSize, setBoxSize] = useState(30); // Initial size of boxes

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
        if (boxSize < 100) setBoxSize(prev => prev + 10); // Max 100px
    };

    const decreaseSize = () => {
        if (boxSize > 20) setBoxSize(prev => prev - 10); // Min 20px
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
                        <div className="col-lg-8">
                            <div className="left-images">
                                <Image src={product?.image} alt={product.productName} width={400} height={400} />
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="right-content">
                                <h4>{product.productName}</h4>
                                <span className="price">{product.productStatus}</span>
                                <span>{product?.totalPixel} pixels available</span>
                                <div className="total">
                                    <h4>{product?.auctionType === 'bidding' ? "Highest Bidding" : "Price"}: ${product.price}</h4>
                                    <div className="main-border-button">
                                        <button>
                                            {product?.auctionType === 'bidding' ? "Bid Now" : "Buy Now"}
                                        </button>
                                    </div>

                                    {/* Zoom Controls */}
                                    <div className="d-flex align-items-center gap-2 mt-4">
                                        <button className="btn btn-sm btn-primary" onClick={decreaseSize}>-</button>
                                        <span>Zoom</span>
                                        <button className="btn btn-sm btn-primary" onClick={increaseSize}>+</button>
                                    </div>

                                    {/* Boxes Grid */}
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
