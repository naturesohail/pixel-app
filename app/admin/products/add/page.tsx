'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/app/utills/Spinner';
import Button from '@/app/utills/Button';
import AdminLayout from '@/app/layouts/AdminLayout';

export default function AddProduct() {
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productStatus, setProductStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const MAX_FILE_SIZE = 1 * 1024 * 1024;

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
      formData.append('categories', categories.join(','));
      formData.append('description', description);
      formData.append('price', price);
      formData.append('productStatus', productStatus);
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
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter Product Name" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Categories</label>
            <select value={categories.join(',')} onChange={(e) => setCategories(e.target.value.split(','))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Living</option>
              <option value="automobile">Automobile</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input type="text" value={price} onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter Price" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product Status</label>
            <select value={productStatus} onChange={(e) => setProductStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">Select Status</option>
              <option value="available">Available</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter product description" rows={4} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {imagePreview && (
              <div className="mt-2">
                <Image src={imagePreview} width={150} height={150} alt="Product Preview" className="rounded-md shadow" />
              </div>
            )}
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
