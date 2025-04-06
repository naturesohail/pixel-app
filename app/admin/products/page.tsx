'use client';
import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Product } from '@/app/types/productTypes';
import { Spinner } from '@/app/utills/Spinner';
import DropdownMenu from '@/app/components/admin/DropdownComponent';
import AdminLayout from '@/app/layouts/AdminLayout';
import Image from 'next/image';

export default function Products() {
  
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products?id=${propertyToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product');

      setProducts(prev => prev.filter(product => product._id !== propertyToDelete));
      setIsDeleteOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => router.push('/admin/products/add')}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Product', 'Price', 'Image', 'Category', 'Status','view', 'Actions'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6">
                    <Spinner />
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{product.productName}</td>
                    <td className="px-6 py-4">${product?.price}</td>
                    <td className="px-6 py-4">
                      <Image src={product?.image} width={80} height={80} className="rounded-lg shadow-md" alt={product.productName} />
                    </td>
                    <td className="px-6 py-4">{product.categoryName ?? '-'}</td>

                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {product?.productStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <button
                          onClick={() => router.push(`/admin/products/details/${decodeURIComponent(product._id)}`)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                           View 
                        </button>
                        
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <DropdownMenu buttonContent={<span>•••</span>}>
                        <button
                          onClick={() => router.push(`/admin/products/edit/${decodeURIComponent(product._id)}`)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {
                            setPropertyToDelete(product._id);
                            setIsDeleteOpen(true);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                        >
                          🗑️ Delete
                        </button>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDeleteOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold">Confirm Deletion</h2>
            <p className="mt-4">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
