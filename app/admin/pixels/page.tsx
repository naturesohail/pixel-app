'use client';
import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/app/utills/Spinner';
import AdminLayout from '@/app/layouts/AdminLayout';

interface PixelConfig {
  _id: string;
  pricePerPixel: number;
  oneTimePrice: number;
  totalPixels: number;
  availablePixels: number;
  createdAt: string;
}

export default function Pixels() {
  const [isLoading, setIsLoading] = useState(true);
  const [configs, setConfigs] = useState<PixelConfig[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await fetch('/api/pixels');
        if (!response.ok) throw new Error('Failed to fetch configurations');

        const data = await response.json();
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

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pixel Configurations</h1>
        {configs.length === 0 && (
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
                {['Price/Pixel', 'One-Time Price', 'Total Pixels', 'Actions'].map(header => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-6">
                    <Spinner />
                  </td>
                </tr>
              ) : configs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6">
                    No configurations found. Click "Add Configuration" to create one.
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr key={config._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">${config.pricePerPixel}</td>
                    <td className="px-6 py-4">${config.oneTimePrice?.toFixed(2)}</td>
                    <td className="px-6 py-4">{config.totalPixels?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/admin/pixels/edit?id=${config._id}`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        ✏️ Edit
                      </button>
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
