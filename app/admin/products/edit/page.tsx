'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Spinner } from '@/app/utills/Spinner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/app/types/productTypes';
import Button from '@/app/utills/Button';
import AdminLayout from '@/app/layouts/AdminLayout';

function EditProductContent() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<{ _id: string; category: string }[]>([]);
  const [category, setCategory] = useState<string>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data: Product = await response.json();
      setEditingProduct(data);
      setImagePreview(data.image || null);
      setCategory(data.categoryId || '');
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to fetch product data.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [fetchProduct]);

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
      const formData = new FormData();
      formData.append('productName', (e.currentTarget.productName as HTMLInputElement).value);
      formData.append('category', category);
      formData.append('description', (e.currentTarget.description as HTMLTextAreaElement).value);
      formData.append('price', (e.currentTarget.price as HTMLInputElement).value);
      formData.append('productStatus', (e.currentTarget.productStatus as HTMLSelectElement).value);

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`/api/products?id=${productId}`, {
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
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-10">Edit Product</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input 
                  type="text" 
                  name="productName" 
                  defaultValue={editingProduct?.productName} 
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.category}</option>
                  ))}
                </select>
              </div>
             
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input 
                  type="text" 
                  name="price" 
                  defaultValue={editingProduct?.price} 
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Status</label>
                <select 
                  name="productStatus" 
                  defaultValue={editingProduct?.productStatus || ""} 
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Status</option>
                  <option value="available">Available</option>
                  <option value="sold-out">Sold Out</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <input type="file" name="image" accept="image/*" onChange={handleImageChange}  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                {imagePreview && (
                  <div className="mb-2">
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-300" />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
              name='description'
              defaultValue={editingProduct?.description || ""} 
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter product description" rows={4} />
            </div>
              <div className="md:col-span-2 flex justify-end">
                <Button isLoading={isSubmitting}>Update Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function EditProduct() {
  return (
    <Suspense fallback={<Spinner />}>
      <EditProductContent />
    </Suspense>
  );
}
