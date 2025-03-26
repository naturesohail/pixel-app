'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/app/utills/Button';
import AdminLayout from '@/app/layouts/AdminLayout';

interface Category {
  _id: string;
  category: string;
}

export default function AddProduct() {
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [instantPrice, setInstantPrice] = useState('');
  const [productStatus, setProductStatus] = useState('');
  const [auctionType, setAuctionType] = useState('');
  const [biddingEndTime, setBiddingEndTime] = useState('');
  const [xPosition, setXPosition] = useState('');
  const [yPosition, setYPosition] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const MAX_FILE_SIZE = 1 * 1024 * 1024;

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" is too large (Max: 1MB).`);
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('productName', productName);
      formData.append('categoryId', selectedCategory);
      formData.append('description', description);
      formData.append('price', price);
      if (instantPrice) formData.append('instantPrice', instantPrice);
      formData.append('productStatus', productStatus);
      formData.append('auctionType', auctionType);
      if (biddingEndTime) formData.append('biddingEndTime', biddingEndTime);
      formData.append('xPosition', xPosition);
      formData.append('yPosition', yPosition);
      formData.append('width', width);
      formData.append('height', height);
      if (image) formData.append('image', image);

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to submit product');

      router.push('/admin/products');
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Add New Product</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-700">Product Name</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" required />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm">
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" required />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Instant Price (Optional)</label>
              <input type="number" value={instantPrice} onChange={(e) => setInstantPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Product Status</label>
              <select value={productStatus} onChange={(e) => setProductStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm">
                <option value="">Select Status</option>
                <option value="available">Available</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Auction Type</label>
              <select value={auctionType} onChange={(e) => setAuctionType(e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm">
                <option value="">Select Auction Type</option>
                <option value="bidding">Bidding</option>
                <option value="fixed-price">Fixed Price</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Bidding End Time</label>
              <input type="datetime-local" value={biddingEndTime} onChange={(e) => setBiddingEndTime(e.target.value)}
                className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 w-full" />
              {imagePreview && <Image src={imagePreview} width={150} height={150} alt="Preview" className="mt-2 rounded-lg shadow" />}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button isLoading={isSubmitting}>Add Product</Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
