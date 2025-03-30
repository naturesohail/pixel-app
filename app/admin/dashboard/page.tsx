'use client';
import AdminLayout from '@/app/layouts/AdminLayout';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon 
       } from '@heroicons/react/24/outline';

import {
  
     BarChart,
     Bar,
     XAxis,
     YAxis, 
     CartesianGrid, 
     Tooltip, 
     Legend, 
     ResponsiveContainer, 
     LineChart,
     Line
     } from 'recharts';

const propertyData = [
  { month: 'Jan', sales: 65, rentals: 45 },
  { month: 'Feb', sales: 59, rentals: 49 },
  { month: 'Mar', sales: 80, rentals: 55 },
  { month: 'Apr', sales: 81, rentals: 58 },
  { month: 'May', sales: 56, rentals: 48 },
  { month: 'Jun', sales: 55, rentals: 52 },
];

const propertyTypeData = [
  { type: 'Music', count: 45 },
  { type: 'AI', count: 30 },
  { type: 'Dance', count: 25 },
  { type: 'Finance', count: 15 },
];

export default function Dashboard() {
  const stats = [
    { name: 'Total Products', value: '156', icon: BuildingOfficeIcon },
    { name: 'Categories', value: '89', icon: HomeIcon },
    { name: 'Total Clients', value: '2,345', icon: UserGroupIcon },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Product Trnasactions</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={propertyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#2563eb" name="OneTimePruchase" />
                <Line type="monotone" dataKey="rentals" stroke="#16a34a" name="Bidders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4"></h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563eb" name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}