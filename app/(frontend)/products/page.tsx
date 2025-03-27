"use client";
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FrontendLayout from "@/app/layouts/FrontendLayout";
import Image from "next/image";
import { Product } from "@/app/types/productTypes";
const calculateTimeLeft = (endTime: string) => {
    const difference = new Date(endTime).getTime() - new Date().getTime();
    if (difference <= 0) return "Bidding End";

    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${hours}h ${minutes}m ${seconds}s left`;
};

export default function Page() {
    const [products, setProducts] = useState<Product[]>([]);
    const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("/api/products");
                const data: Product[] = await response.json();
                setProducts(data);

                // Initialize countdown times
                const initialTimeLeft: { [key: string]: string } = {};
                data.forEach(product => {
                    if (product.auctionType === "bidding" && product.biddingEndTime) {
                        initialTimeLeft[product._id] = calculateTimeLeft(product.biddingEndTime);
                    }
                });
                setTimeLeft(initialTimeLeft);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();

        const timer = setInterval(() => {
            setTimeLeft(prevTimeLeft => {
                const updatedTimeLeft: { [key: string]: string } = {};
                products.forEach(product => {
                    if (product.auctionType === "bidding" && product.biddingEndTime) {
                        updatedTimeLeft[product._id] = calculateTimeLeft(product.biddingEndTime);
                    }
                });
                return updatedTimeLeft;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <FrontendLayout>
            <Header />
            <section className="section mt-5" id="products">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-heading">
                                <h2>Our Latest Products</h2>
                                <span>Check out all of our products.</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        {products.map((product) => (
                            <div className="col-lg-4" key={product._id}>
                                <div className="item">
                                    <div className="thumb">
                                        <div className="hover-content">
                                            <ul>
                                                <li>
                                                    <a href={`/products/${product._id}`}>
                                                        <i className="fa fa-eye" />
                                                    </a>
                                                </li>
                                               
                                            </ul>
                                        </div>
                                        <Image src={product.image} alt={product.productName} width={200} height={200} style={{maxHeight:"200px"}} />
                                    </div>
                                    <div className="down-content">
                                        <h4>{product.productName}</h4>
                                        <span>${product.price}

                                        {product?.auctionType === "bidding" && product?.biddingEndTime && (
                                            <span>
                                             {timeLeft[product._id] || "Calculating..."}
                                            </span>
                                        )}
                                        </span>
                                       
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </FrontendLayout>
    );
}
