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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [biddingEndTime, setBiddingEndTime] = useState('');
  const [totalPixel, setTotalPixel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB limit

  // Fetch categories on component mount
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

  // Handle image selection
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const form = e.currentTarget;

      // Using namedItem to access form elements
      formData.append('productName', (form.elements.namedItem('productName') as HTMLInputElement)?.value || '');
      formData.append('categoryId', (form.elements.namedItem('category') as HTMLSelectElement)?.value || '');
      formData.append('price', (form.elements.namedItem('price') as HTMLInputElement)?.value || '');
      formData.append('productStatus', (form.elements.namedItem('productStatus') as HTMLSelectElement)?.value || '');
      formData.append('auctionType', (form.elements.namedItem('auctionType') as HTMLSelectElement)?.value || '');
      if (biddingEndTime) formData.append('biddingEndTime', biddingEndTime);
      if (totalPixel) formData.append('totalPixel', totalPixel);
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
              <input type="text" name="productName" className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" required placeholder="Enter Product Name" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select name="category" className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" required>
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Price</label>
              <input type="number" name="price" className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" required placeholder="Enter Price" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 w-full" />
              {imagePreview && <Image src={imagePreview} width={150} height={150} alt="Preview" className="mt-2 rounded-lg shadow" />}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Product Status</label>
              <select name="productStatus" className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" required>
                <option value="">Select Status</option>
                <option value="available">Available</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Total Pixels</label>
              <input type="number" name="totalPixel" value={totalPixel} onChange={(e) => setTotalPixel(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" placeholder="Total Pixel" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Auction Type</label>
              <select name="auctionType" className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" required>
                <option value="">Select Auction Type</option>
                <option value="bidding">Bidding</option>
                <option value="buy-now">Buy Now</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Bidding End Time</label>
              <input type="datetime-local" name="biddingEndTime" value={biddingEndTime} onChange={(e) => setBiddingEndTime(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" placeholder="Bidding End Time" />
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
