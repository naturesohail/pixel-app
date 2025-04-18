'use client';
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { Dialog, Transition } from '@headlessui/react';
import { Spinner } from '@/app/utills/Spinner';
import { toast } from 'react-toastify';

type Bidder = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
};

export default function Bidders() {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBidder, setSelectedBidder] = useState<Bidder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchBidders = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/bidders', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok) {
          setBidders(data.bidders || []);
        } else {
          toast.error(data.error || 'Failed to fetch bidders');
        }
      } catch (error) {
        console.error('Error fetching bidders:', error);
        toast.error('Failed to fetch bidders');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBidders();
  }, []);

  const openModal = (bidder: Bidder) => {
    setSelectedBidder(bidder);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBidder(null);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedBidder?._id) return;

    try {
      const res = await fetch(`/api/bidders/${selectedBidder._id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setBidders(prev => prev.filter(b => b._id !== selectedBidder._id));
        toast.success('Bidder deleted successfully');
        closeModal();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete bidder');
      }
    } catch (err) {
      console.error('Failed to delete bidder', err);
      toast.error('Failed to delete bidder');
    }
  };

  const toggleStatus = async (bidderId: string, currentStatus: boolean) => {
    setIsUpdating(bidderId);
    try {
      const res = await fetch(`/api/bidders/${bidderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setBidders(prev =>
          prev.map(b =>
            b._id === bidderId ? { ...b, isActive: !currentStatus } : b
          )
        );
        toast.success(`Bidder ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bidders</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : bidders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No bidders found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bidders.map((bidder, index) => (
                  <tr key={bidder._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{bidder.name}</td>
                    <td className="px-6 py-4">{bidder.email}</td>
                    <td className="px-6 py-4">{bidder.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bidder.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {bidder.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => toggleStatus(bidder._id, bidder.isActive)}
                        className={`text-${
                          bidder.isActive ? 'yellow' : 'green'
                        }-600 hover:text-${
                          bidder.isActive ? 'yellow' : 'green'
                        }-900`}
                        disabled={isUpdating === bidder._id}
                      >
                        {isUpdating === bidder._id ? (
                          'Processing...'
                        ) : bidder.isActive ? (
                          'Disable'
                        ) : (
                          'Enable'
                        )}
                      </button>
                      <button
                        onClick={() => openModal(bidder)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Transition show={isModalOpen} as={React.Fragment}>
        <Dialog
          onClose={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="bg-black bg-opacity-50 fixed inset-0"
            aria-hidden="true"
          />
          <div className="bg-white rounded-lg p-6 shadow-lg z-50 max-w-sm mx-auto">
            <Dialog.Title className="text-lg font-bold">
              Confirm Deletion
            </Dialog.Title>
            <p className="mt-2">
              Are you sure you want to delete {selectedBidder?.name}?
              This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </Dialog>
      </Transition>
    </AdminLayout>
  );
}