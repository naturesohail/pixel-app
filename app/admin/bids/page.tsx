'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import Image from 'next/image';
import { CheckCircleIcon, XCircleIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Spinner } from '@/app/utills/Spinner';

interface Bid {
  _id: string;
  title: string;
  description: string;
  images: string[];
  userId: string;
  pixelCount: number;
  bidAmount: number;
  bidIndex: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'expired';
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'approved' | 'rejected' | 'paid' | 'expired'>('approved');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');

  useEffect(() => {
    fetchBids();
  }, [filter]);

  const fetchBids = async () => {
    setIsLoading(true);
    const res = await fetch(`/api/admin/bids?status=${filter}`);
    const data = await res.json();
    setBids(data);
    setIsLoading(false);
  };

  const updateBidStatus = async () => {
    if (!selectedBid) return;
    
    setProcessing(true);
    const res = await fetch(`/api/admin/bids/${selectedBid._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      fetchBids();
      setShowStatusModal(false);
    }
    setProcessing(false);
  };

  const openStatusModal = (bid: Bid, status: typeof newStatus) => {
    setSelectedBid(bid);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'approved':
        return <span className={`${baseClass} bg-green-100 text-green-800`}>Won</span>;
      case 'paid':
        return <span className={`${baseClass} bg-blue-100 text-blue-800`}>Paid</span>;
      case 'rejected':
        return <span className={`${baseClass} bg-red-100 text-red-800`}>Rejected</span>;
      case 'expired':
        return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Expired</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>Pending</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto p-6 bg-white shadow rounded-lg">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Bids Management</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              All Bids
            </button>
            <button 
              onClick={() => setFilter('pending')} 
              className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('approved')} 
              className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Won
            </button>
            <button 
              onClick={() => setFilter('paid')} 
              className={`px-4 py-2 rounded ${filter === 'paid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Paid
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Bid Index</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Pixels</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <Spinner />
                  </td>
                </tr>
              ) : bids.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No bids found
                  </td>
                </tr>
              ) : (
                bids.map((bid, index) => (
                  <tr key={bid._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {bid.images[0] && (
                          <Image 
                            src={bid.images[0]} 
                            alt={bid.title} 
                            width={40} 
                            height={40} 
                            className="rounded mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium">{bid.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{bid.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {bid.user?.name || 'N/A'}
                      <div className="text-sm text-gray-500">{bid.user?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4">#{bid.bidIndex}</td>
                    <td className="px-6 py-4">${bid.bidAmount}</td>
                    <td className="px-6 py-4">{bid.pixelCount}</td>
                    <td className="px-6 py-4">{getStatusBadge(bid.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {bid.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => openStatusModal(bid, 'approved')}
                            className="text-green-600 hover:text-green-800"
                            title="Mark as Won"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => openStatusModal(bid, 'rejected')}
                            className="text-red-600 hover:text-red-800"
                            title="Reject Bid"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {bid.status === 'approved' && (
                        <button 
                          onClick={() => openStatusModal(bid, 'paid')}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mark as Paid"
                        >
                          <CurrencyDollarIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showStatusModal && selectedBid && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {newStatus === 'approved' && 'Mark Bid as Won'}
                {newStatus === 'paid' && 'Confirm Payment'}
                {newStatus === 'rejected' && 'Reject Bid'}
              </h2>
              
              <div className="mb-4">
                <p>Bid for: <strong>{selectedBid.title}</strong></p>
                <p>User: <strong>{selectedBid.user?.name || 'N/A'}</strong></p>
                <p>Amount: <strong>${selectedBid.bidAmount}</strong></p>
              </div>

              {newStatus === 'paid' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-700">This will mark the bid as paid and give the user access to the product.</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBidStatus}
                  disabled={processing}
                  className={`px-4 py-2 rounded-md text-white ${
                    newStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                    newStatus === 'paid' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center">
                      <Spinner  />
                      Processing...
                    </span>
                  ) : (
                    <>
                      {newStatus === 'approved' && 'Mark as Won'}
                      {newStatus === 'paid' && 'Confirm Payment'}
                      {newStatus === 'rejected' && 'Reject Bid'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}