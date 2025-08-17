'use client';
import AdminLayout from '@/app/layouts/AdminLayout';
import { 
  ShoppingCartIcon, 
  TagIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CalendarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState, useRef } from 'react';
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
  availableYears?: number[];
  currentFilter?: string;
  specificYear?: string | null;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('year');
  const [filterLoading, setFilterLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const fetchData = async (filterParam: string, year?: number) => {
    try {
      setFilterLoading(true);
      
      // Build URL with parameters
      let url = `/api/admin/dashboard?filter=${filterParam}`;
      if (year) {
        url += `&year=${year}`;
        setSelectedYear(year);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setFilter(filterParam);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setFilterLoading(false);
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    fetchData(filter);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (newFilter: string) => {
    if (newFilter !== filter) {
      setSelectedYear(null);
      fetchData(newFilter);
    }
  };

  const handleYearChange = (year: number) => {
    fetchData('specificYear', year);
  };

  const getFilterTitle = () => {
    if (filter === 'specificYear' && selectedYear) {
      return selectedYear.toString();
    }
    
    switch(filter) {
      case 'today': return 'Today';
      case 'year': return 'This Year';
      case 'prevYear': return 'Last Year';
      case 'allTime': return 'All Time';
      default: return 'This Year';
    }
  };

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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <ChartBarIcon className="h-6 w-6 text-indigo-500 mr-2" />
              <h2 className="text-xl font-bold">Revenue Overview</h2>
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="mr-2 text-gray-700">Filter:</span>
                <div className="relative inline-block text-left">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    {getFilterTitle()}
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        <button 
                          onClick={() => handleFilterChange('today')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            filter === 'today' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Today
                        </button>
                        <button 
                          onClick={() => handleFilterChange('year')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            filter === 'year' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          This Year
                        </button>
                        <button 
                          onClick={() => handleFilterChange('prevYear')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            filter === 'prevYear' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Last Year
                        </button>
                        <button 
                          onClick={() => handleFilterChange('allTime')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            filter === 'allTime' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          All Time
                        </button>
                        
                        <div className="border-t border-gray-200 my-1"></div>
                        <div className="px-4 py-2 text-xs text-gray-500 font-medium">
                          Select Specific Year
                        </div>
                        {data?.availableYears?.map(year => (
                          <button 
                            key={year}
                            onClick={() => handleYearChange(year)}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              filter === 'specificYear' && selectedYear === year
                                ? 'bg-blue-100 text-blue-800' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {filterLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          ) : (
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
                      text: filter === 'specificYear' && selectedYear 
                        ? `Revenue for ${selectedYear}`
                        : `Revenue Data (${getFilterTitle()})`,
                    },
                  },
                }}
              />
            </div>
          )}
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