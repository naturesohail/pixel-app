'use client';
import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/app/utills/Spinner';
import DropdownMenu from '@/app/components/admin/DropdownComponent';
import AdminLayout from '@/app/layouts/AdminLayout';

interface PixelConfig {
  id: string;
  pricePerPixel: number;
  oneTimePrice: number;
  totalPixels: number;
  availablePixels: number;
  createdAt: string;
}

export default function Pixels() {
  const [isLoading, setIsLoading] = useState(true);
  const [configs, setConfigs] = useState<PixelConfig[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await fetch('/api/pixels');
        if (!response.ok) throw new Error('Failed to fetch configurations');

        const data = await response.json();
        // Check if we have a config object in the response
        if (data.config) {
          setConfigs([data.config]);
        } else if (data.configs) {
          setConfigs(data.configs);
        } else {
          setConfigs([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleDelete = async () => {
    if (!configToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pixels?id=${configToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete configuration');

      setConfigs(prev => prev.filter(config => config.id !== configToDelete));
      setIsDeleteOpen(false);
      setConfigToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete configuration');
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateSoldPercentage = (config: PixelConfig) => {
    const sold = config.totalPixels - config.availablePixels;
    return ((sold / config.totalPixels) * 100).toFixed(1);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pixel Configurations</h1>
        {configs.length === 0 && ( // Only show the button if no config exists
          <button
            onClick={() => router.push('/admin/pixels/add')}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Configuration
          </button>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Price/Pixel', 'One-Time Price', 'Total Pixels', 'Available', 'Sold %', 'Created', 'Actions'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6">
                    <Spinner />
                  </td>
                </tr>
              ) : configs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6">
                    No configurations found. Click "Add Configuration" to create one.
                  </td>
                </tr>
              ) : (
                configs.map((config, index) => (
                  <tr key={config.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">${config.pricePerPixel.toFixed(2)}</td>
                    <td className="px-6 py-4">${config.oneTimePrice.toFixed(2)}</td>
                    <td className="px-6 py-4">{config.totalPixels.toLocaleString()}</td>
                    <td className="px-6 py-4">{config.availablePixels.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {calculateSoldPercentage(config)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(config.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu buttonContent={<span>•••</span>}>
                        <button
                          onClick={() => router.push(`/admin/pixels/edit?id=${config.id}`)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {
                            setConfigToDelete(config.id);
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
            <p className="mt-4">Are you sure you want to delete this configuration? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
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