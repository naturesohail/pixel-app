'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Spinner } from '@/app/utills/Spinner';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/app/types/productTypes';
import Button from '@/app/utills/Button';
import Select from 'react-select';
import AdminLayout from '@/app/layouts/AdminLayout';
function EditProductContent() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    try {
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) throw new Error(`Failed to fetch product: ${response.statusText}`);
      const data: Product = await response.json();
      setEditingProduct(data);
      setImagePreview(data.image || null);
      setCategories(data.categories ? data.categories.split(',') : []);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to fetch product data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('categories', categories.join(','));

      const response = await fetch(`/api/products/${slug}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update product');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
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
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input 
                  type="text" 
                  name="productName" 
                  defaultValue={editingProduct?.productName} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Categories</label>
                <Select
                  isMulti
                  options={[
                    { value: 'Electronics', label: 'Electronics' },
                    { value: 'Fashion', label: 'Fashion' },
                    { value: 'Home', label: 'Home & Living' },
                    { value: 'Automobile', label: 'Automobile' }
                  ]}
                  value={categories.map(cat => ({ value: cat, label: cat }))}
                  onChange={selected => setCategories(selected.map(s => s.value))}
                  className="mt-1 block w-full"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input 
                  type="text" 
                  name="price" 
                  defaultValue={editingProduct?.price} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Product Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Status</label>
                <select 
                  name="productStatus" 
                  defaultValue={editingProduct?.productStatus || ""} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Status</option>
                  <option value="available">Available</option>
                  <option value="sold-out">Sold Out</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  name="description" 
                  defaultValue={editingProduct?.description} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={4}
                />
              </div>

              {/* Product Image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <input 
                  type="file" 
                  name="image" 
                  onChange={handleImageChange} 
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <Image src={imagePreview} alt="Product preview" width={200} height={200} className="rounded-lg shadow" />
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && <p className="text-red-500 text-sm md:col-span-2">{error}</p>}

              {/* Submit Button */}
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
