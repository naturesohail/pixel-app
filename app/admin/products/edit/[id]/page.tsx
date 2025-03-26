'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/app/utills/Button';
import AdminLayout from '@/app/layouts/AdminLayout';
import { useParams } from 'next/navigation';

interface Category {
  _id: string;
  category: string;
}

interface Product {
  _id: string;
  productName: string;
  categoryId: string;
  price: string;
  productStatus: string;
  auctionType: string;
  biddingEndTime: string;
  totalPixel: string;
  image: string;
}

export default function EditProduct() {
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id: productId } = useParams(); // ✅ Extract ID from URL

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

    async function fetchProduct() {
      if (!productId) return;
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data: Product = await res.json();
        setProduct(data);
        setImagePreview(data.image);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    }

    fetchCategories();
    fetchProduct();
  }, [productId]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`/api/products/?id=${productId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update product');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Product</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-700">Product Name</label>
              <input type="text" name="productName" defaultValue={product?.productName} required className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select name="categoryId" defaultValue={product?.categoryId} className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" required>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Price</label>
              <input type="number" name="price" defaultValue={product?.price} required className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Product Image</label>
              <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="mt-1 w-full" />
              {imagePreview && <Image src={imagePreview} width={150} height={150} alt="Preview" className="mt-2 rounded-lg shadow" />}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Product Status</label>
              <select name="productStatus" defaultValue={product?.productStatus} className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm">
                <option value="">Select Status</option>
                <option value="available">Available</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Total Pixels</label>
              <input type="number" name="totalPixel" defaultValue={product?.totalPixel} className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Auction Type</label>
              <select name="auctionType" defaultValue={product?.auctionType} className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm">
                <option value="">Select Auction Type</option>
                <option value="bidding">Bidding</option>
                <option value="fixed-price">Fixed Price</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bidding End Time</label>
              <input type="datetime-local" name="biddingEndTime" defaultValue={product?.biddingEndTime} className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button isLoading={isSubmitting}>Update Product</Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}