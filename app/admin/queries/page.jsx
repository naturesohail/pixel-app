'use client'
import React, { useEffect, useState } from 'react';
import AdminLayout from "@/app/layouts/AdminLayout";
import { Dialog, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Queries() {
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        setQueries(data.contacts || []);
        setFilteredQueries(data.contacts || []);
      } catch (error) {
        console.error("Error fetching queries:", error);
        setError("Failed to load queries");
      }
    };
    fetchQueries();
  }, []);

  // Fixed search functionality with null checks
  useEffect(() => {
    const filtered = queries.filter(query => {
      const name = query.name ? query.name.toLowerCase() : '';
      const email = query.email ? query.email.toLowerCase() : '';
      const message = query.message ? query.message.toLowerCase() : '';
      const term = searchTerm.toLowerCase();
      
      return name.includes(term) || 
             email.includes(term) || 
             message.includes(term);
    });
    setFilteredQueries(filtered);
  }, [searchTerm, queries]);

  const openModal = (query) => {
    setSelectedQuery(query);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuery(null);
    setIsDeleting(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!selectedQuery?._id) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/contact/${selectedQuery._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error('Failed to delete query');
      }

      setQueries(prev => prev.filter(q => q._id !== selectedQuery._id));
      setFilteredQueries(prev => prev.filter(q => q._id !== selectedQuery._id));
      
      closeModal();
    } catch (err) {
      console.error("Failed to delete query", err);
      setError(err.message || "Failed to delete query");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Queries</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search by name, email or message"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredQueries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? "No matching queries found" : "No queries available"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQueries.map((query, index) => (
                  <tr key={query._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{query.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{query.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{query.message || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openModal(query)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                        title="Delete query"
                      >
                        <TrashIcon className="h-5 w-5 mr-1" />
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

      {/* Delete Modal */}
      <Transition show={isModalOpen}>
        <Dialog onClose={closeModal} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 fixed inset-0" aria-hidden="true" />
          <div className="bg-white rounded-lg p-6 shadow-lg z-50 max-w-sm mx-auto">
            <Dialog.Title className="text-lg font-bold">Confirm Deletion</Dialog.Title>
            <p className="mt-2">Are you sure you want to delete this query from {selectedQuery?.name || 'unknown user'}?</p>
            
            {error && (
              <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            <div className="mt-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={closeModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </Dialog>
      </Transition>
    </AdminLayout>
  );
}