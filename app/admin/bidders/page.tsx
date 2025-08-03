'use client';
import React, { Fragment, useEffect, useState } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { Dialog, Transition } from '@headlessui/react';
import { Spinner } from '@/app/utills/Spinner';
import { toast } from 'react-toastify';
import { EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type Bidder = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  companyName?: string;
  industry?: string;
  website?: string;
  businessDescription?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function Bidders() {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedBidder, setSelectedBidder] = useState<Bidder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchBidders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/bidders?page=${currentPage}&limit=${limit}&search=${searchTerm}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (res.ok) {
        setBidders(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.totalUsers || 0);
      } else {
        toast.error(data.error || 'Failed to fetch bidders');
      }
    } catch (error: any) {
      console.error('Error fetching bidders:', error);
      toast.error('Failed to fetch bidders: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBidders();
  }, [currentPage, limit, searchTerm]);

  const openDeleteModal = (bidder: Bidder) => {
    setSelectedBidder(bidder);
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = (bidder: Bidder) => {
    setSelectedBidder(bidder);
    setIsDetailModalOpen(true);
  };

  const closeModals = () => {
    setSelectedBidder(null);
    setIsDeleteModalOpen(false);
    setIsDetailModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedBidder?._id) return;

    try {
      const res = await fetch(`/api/bidders/${selectedBidder._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Bidder deleted successfully');
        closeModals();
        fetchBidders(); // Refresh data
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
        toast.success(`Bidder ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
        fetchBidders(); // Refresh data
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

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bidders</h1>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search bidders..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-700">Show:</span>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-gray-700">entries</span>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : bidders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'No matching bidders found' : 'No bidders found'}
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bidders.map((bidder, index) => (
                    <tr key={bidder._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{(currentPage - 1) * limit + index + 1}</td>
                      <td className="px-6 py-4">{bidder?.companyName || '-'}</td>
                      <td className="px-6 py-4">{bidder.name}</td>
                      <td className="px-6 py-4">{bidder.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bidder.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {bidder.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDetailModal(bidder)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => toggleStatus(bidder._id, bidder.isActive)}
                          className={`${bidder.isActive
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                            } font-medium px-2 py-1`}
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
                          onClick={() => openDeleteModal(bidder)}
                          className="text-red-600 hover:text-red-900 font-medium px-2 py-1"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
                <div className="text-sm text-gray-700 mb-4 md:mb-0">
                  Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * limit, totalUsers)}</span> of{' '}
                  <span className="font-medium">{totalUsers}</span> bidders
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${currentPage === 1 
                      ? 'bg-gray-200 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 
                      ? i + 1 
                      : currentPage >= totalPages - 2 
                        ? totalPages - 4 + i 
                        : currentPage - 2 + i;
                    
                    return page > 0 && page <= totalPages ? (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ) : null;
                  })}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages 
                      ? 'bg-gray-200 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Transition show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          onClose={closeModals}
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
                onClick={closeModals}
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

      {/* Bidder Details Modal */}
      <Transition show={isDetailModalOpen} as={Fragment}>
        <Dialog
          onClose={closeModals}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="bg-black bg-opacity-50 fixed inset-0"
            aria-hidden="true"
          />
          <div className="bg-white rounded-lg p-6 shadow-lg z-50 max-w-lg w-full mx-4">
            <Dialog.Title className="text-xl font-bold flex items-center">
              <EyeIcon className="h-6 w-6 mr-2 text-blue-600" />
              Bidder Details
            </Dialog.Title>

            {selectedBidder && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-gray-900">{selectedBidder.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Company</label>
                    <p className="text-gray-900">{selectedBidder.companyName || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900">{selectedBidder.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedBidder.phone || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Industry</label>
                    <p className="text-gray-900">{selectedBidder.industry || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Website</label>
                    <p className="text-gray-900">
                      {selectedBidder.website ? (
                        <a
                          href={selectedBidder.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedBidder.website}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Business Description</label>
                    <p className="text-gray-900 whitespace-pre-line">
                      {selectedBidder.businessDescription || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedBidder.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {selectedBidder.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                    <p className="text-gray-900">{formatDate(selectedBidder.createdAt)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                    <p className="text-gray-900">{formatDate(selectedBidder.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={closeModals}
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      </Transition>
    </AdminLayout>
  );
}