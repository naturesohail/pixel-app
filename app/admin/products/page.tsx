'use client';
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Product } from '@/app/types/productTypes';
import { Spinner } from '@/app/utills/Spinner';
import DropdownMenu from '@/app/components/admin/DropdownComponent';
import AdminLayout from '@/app/layouts/AdminLayout';
import Image from 'next/image';

export default function Properties() {

  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Product[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProperties = async () => {
      const response = await fetch('/api/products');
      const data = await response.json();
      console.log(data);
      setProperties(data);
      setIsLoading(false);
    };
    fetchProperties();

  }, []);

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/products?id=${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setProperties(prev => prev.filter(product => product._id !== id));
    } else {
      console.error('Failed to delete product');
    }
  };

  const confirmDelete = () => {
    if (propertyToDelete !== null) {
      handleDelete(propertyToDelete);
      setPropertyToDelete(null);
    }
    setIsDeleteOpen(false);
  };

  return (
    <AdminLayout>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => router.push('/admin/products/add')}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {
                isLoading ? (
                  <tr className='mt-2'>
                    <td colSpan={8} className="text-center">
                      <Spinner />
                    </td>
                  </tr>
                ) : (
                  properties.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">${product?.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Image src={product?.image} width={80} height={80} className="rounded-lg shadow-md" alt={product.productName} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.categoryId??"-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {product?.productStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu buttonContent={<span>•••</span>}>
                          <button
                            onClick={() => {
                              router.push(`/admin/products/edit?id=${decodeURIComponent(product._id)}`);
                            }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              setPropertyToDelete(product._id);
                              setIsDeleteOpen(true);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100">
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
    </AdminLayout>
  );
}
