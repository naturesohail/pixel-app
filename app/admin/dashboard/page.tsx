'use client';
import AdminLayout from '@/app/layouts/AdminLayout';
import { ShoppingCartIcon, TagIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Spinner } from '@/app/utills/Spinner';

type DashboardData = {
  totalProducts: number;
  activeBids: number;
  totalUsers: number;
  revenue: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const mockData = {
          totalProducts: 156,
          activeBids: 89,
          totalUsers: 2345,
          revenue: 12500
        };

        setData(mockData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <ShoppingCartIcon className="h-6 w-6 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-xl font-bold">{data?.totalProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <TagIcon className="h-6 w-6 text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Active Bids</p>
              <p className="text-xl font-bold">{data?.activeBids || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <UsersIcon className="h-6 w-6 text-purple-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-bold">{data?.totalUsers?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold">${data?.revenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}