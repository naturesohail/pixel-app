"use client";
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FrontendLayout from "@/app/layouts/FrontendLayout";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Product {
  _id: string;
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
  status?: 'active' | 'sold' | 'expired';
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error fetching product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return (
    <FrontendLayout>
      <Header />
      <div className="container py-5 text-center">Loading product...</div>
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

  if (!product) return (
    <FrontendLayout>
      <Header />
      <div className="container py-5">
        <div className="alert alert-warning">Product not found</div>
      </div>
      <Footer />
    </FrontendLayout>
  );

  return (
    <FrontendLayout>
      <Header />

      <div className="container my-5 mt-5">
        <div className="row">
          <div className="col-md-6">
            <div className="product-images mb-4">
              {product.images.length > 0 ? (
                <div className="row g-3">
                  {product.images.map((img, i) => (
                    <div key={i} className="col-12 mt-5">
                      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                        <Image
                          src={img}
                          alt={`${product.title} - Image ${i + 1}`}
                          fill
                          style={{ objectFit: 'contain', marginTop: "50px" }}
                          className="rounded"
                          priority={i === 0}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 bg-light rounded">
                  <p>No images available</p>
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <h1 className="mb-3">{product.title}</h1>

            <div className="d-flex align-items-center mb-4">
              <h2 className="mb-0">${product.price.toFixed(2)}</h2>


            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title"></h5>
                <dl className="row">
                  <dt className="col-sm-4">Category</dt>
                  <dd className="col-sm-8">{product.category || 'N/A'}</dd>


                  {product.pixelIndex && (
                    <>
                      <dt className="col-sm-4">Title</dt>
                      <dd className="col-sm-8">{product.title}</dd>
                    </>
                  )}



                  {product.url && (
                    <>
                      <dt className="col-sm-4">Website</dt>
                      <dd className="col-sm-8">
                        <a href={product.url} target="_blank" rel="noopener noreferrer">
                          {product.url}
                        </a>
                      </dd>
                    </>
                  )}
                </dl>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Description</h5>
                <p className="card-text">
                  {product.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Additional Information</h5>
                <p className="card-text text-muted">
                  Listed on {new Date(product.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </FrontendLayout>
  );
}