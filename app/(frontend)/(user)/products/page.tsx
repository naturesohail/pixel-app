'use client';
import React, { useState, useEffect } from 'react';
import FrontEndLayout from '@/app/layouts/FrontendLayout';
import { Spinner } from '@/app/utills/Spinner';
import Header from '@/app/components/Header';
import { useAuth } from '@/app/context/AuthContext';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  url?: string;
  pixelCount?: number;
  status?: string;
  purchaseType?: string;
  expiryDate?: string;
  createdAt: string;
}

export default function UserProductsView() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        if (!user?._id) return;
        
        const res = await fetch(`/api/products/user/${user._id}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        
        const data: Product[] = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [user?._id]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredProducts(
      products.filter(product => 
        product.title.toLowerCase().includes(value) ||
        (product.description && product.description.toLowerCase().includes(value)) ||
        product.price.toString().includes(value) ||
        (product.status && product.status.toLowerCase().includes(value))
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <FrontEndLayout>
      <Header />
      <div className="max-w-7xl mx-auto p-6 bg-white shadow-md rounded-lg mt-40">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Products</h1>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search products..."
            className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:ring"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">#</th>
                  <th className="px-4 py-2 border-b">Title</th>
                  <th className="px-4 py-2 border-b">Description</th>
                  <th className="px-4 py-2 border-b">Price</th>
                  <th className="px-4 py-2 border-b">Pixels</th>
                  <th className="px-4 py-2 border-b">Type</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{index + 1}</td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex items-center">
                        {product.images?.length > 0 && (
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded-md mr-2"
                          />
                        )}
                        <span>{product.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {product.description?.substring(0, 50)}{product.description?.length > 50 ? '...' : ''}
                    </td>
                    <td className="px-4 py-2 border-b">
                      ${product.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {product.pixelCount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-4 py-2 border-b capitalize">
                      {product.purchaseType?.replace('-', ' ') || 'N/A'}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'won' ? 'bg-blue-100 text-blue-800' :
                        product.status === 'sold' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {formatDate(product.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FrontEndLayout>
  );
}