'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/app/layouts/AdminLayout';
import { Spinner } from '@/app/utills/Spinner';
import {Bid} from "@/app/types/bidTypes"
export default function ProductBidsView() {
  const { id: productId } = useParams();
  const [bids, setBids] = useState<Bid[]>([]);
  const [filteredBids, setFilteredBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchBids() {
      try {
        const res = await fetch(`/api/bids/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch bids');
        const data: Bid[] = await res.json();
        setBids(data);
        setFilteredBids(data);
      } catch (err) {
        console.error('Error loading bids:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) fetchBids();
  }, [productId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredBids(
      bids.filter(
        (bid) =>
          bid.userId.name.toLowerCase().includes(value) ||
          bid.userId.email.toLowerCase().includes(value)
      )
    );
  };

  const handleDelete = async (bidId: string) => {
    if (!confirm('Are you sure you want to delete this bid?')) return;

    try {
      const res = await fetch(`/api/bids?id=${bidId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete bid');

      // Remove from both states
      setBids((prev) => prev.filter((b) => b._id !== bidId));
      setFilteredBids((prev) => prev.filter((b) => b._id !== bidId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete bid.');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bidders List</h1>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by name or email"
            className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:ring"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : filteredBids.length === 0 ? (
          <p className="text-gray-500">No matching bids found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">#</th>
                  <th className="px-4 py-2 border-b">User Name</th>
                  <th className="px-4 py-2 border-b">Email</th>
                  <th className="px-4 py-2 border-b">Phone</th>
                  <th className="px-4 py-2 border-b">Bid Amount</th>
                  <th className="px-4 py-2 border-b">Pixels</th>
                  <th className="px-4 py-2 border-b">Time</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids.map((bid, index) => (
                  <tr key={bid._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{index + 1}</td>
                    <td className="px-4 py-2 border-b">{bid?.userId?.name}</td>
                    <td className="px-4 py-2 border-b">{bid?.userId?.email}</td>
                    <td className="px-4 py-2 border-b">{bid?.userId?.phone}</td>
                    <td className="px-4 py-2 border-b">${bid.bidAmount.toLocaleString()}</td>
                    <td className="px-4 py-2 border-b">{bid.totalPixels.toLocaleString()}</td>
                    <td className="px-4 py-2 border-b">
                      {new Date(bid.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleDelete(bid._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
