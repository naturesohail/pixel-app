// app/components/admin/Dashboard.tsx
'use client';
import AdminLayout from '@/app/layouts/AdminLayout';
import { ShoppingCartIcon, TagIcon, UsersIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Spinner } from '@/app/utills/Spinner';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type DashboardData = {
  totalTransactions: number;
  activeBids: number;
  totalUsers: number;
  revenue: number;
  revenueData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  recentTransactions: {
    id: string;
    userName: string;
    productName: string;
    amount: number;
    date: string;
    status: string;
  }[];
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
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

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <ShoppingCartIcon className="h-6 w-6 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-xl font-bold">{data?.totalTransactions?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <TagIcon className="h-6 w-6 text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Active Bids</p>
              <p className="text-xl font-bold">{data?.activeBids?.toLocaleString() || 0}</p>
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

      {data?.revenueData && (
        <div className="bg-white p-6 rounded shadow mb-8">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-6 w-6 text-indigo-500 mr-2" />
            <h2 className="text-xl font-bold">Revenue Overview ({new Date().getFullYear()})</h2>
          </div>
          <div className="h-80">
            <Bar
              data={data.revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Monthly Revenue',
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        {data?.recentTransactions?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${transaction.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent transactions</p>
        )}
      </div>
    </AdminLayout>
  );
}