'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Spinner } from '@/app/utills/Spinner';
import Head from 'next/head';

interface Industry {
  _id: string;
  industry: string;
  createdAt: string;
  updatedAt: string;
}

export default function Industries() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [industryName, setIndustryName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [industryToDelete, setIndustryToDelete] = useState<Industry | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/industries');
      const data = await res.json();
      if (data.success) {
        setIndustries(data.industries);
      } else {
        setError('Failed to fetch industries');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEditIndustry = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    
    try {
      const payload = { industry: industryName };
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode 
        ? `/api/admin/industries/${selectedIndustry?._id}`
        : '/api/admin/industries';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        fetchIndustries();
        closeModal();
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!industryToDelete) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/industries/${industryToDelete._id}`, { 
        method: 'DELETE' 
      });
      
      const data = await res.json();
      
      if (res.ok) {
        fetchIndustries();
        setShowDeleteModal(false);
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (industry: Industry | null = null) => {
    setSelectedIndustry(industry);
    setIndustryName(industry ? industry.industry : '');
    setEditMode(!!industry);
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setIndustryName('');
    setEditMode(false);
    setProcessing(false);
    setError(null);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manage Industries | Admin Dashboard</title>
        <meta name="description" content="Manage industries for your business categories and services" />
        <meta name="keywords" content="industries, business categories, services" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="/admin/industries" />
      </Head>

      <div className="max-w-8xl mx-auto p-6 bg-white shadow rounded-lg">
        <div className="flex justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Industry Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your business industries and categories
            </p>
          </div>
          <button 
            onClick={() => openModal()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-1" /> Add Industry
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <Spinner />
                    <p className="mt-2 text-gray-600">Loading industries...</p>
                  </td>
                </tr>
              ) : industries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6">
                      <div className="text-gray-400 mb-2">No industries found</div>
                      <button 
                        onClick={() => openModal()} 
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Add your first industry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                industries.map((industry, index) => (
                  <tr key={industry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {industry.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(industry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openModal(industry)} 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        aria-label={`Edit ${industry.industry}`}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                     
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Industry Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="border-b p-4">
                <h2 className="text-xl font-bold">
                  {editMode ? 'Edit Industry' : 'Add New Industry'}
                </h2>
              </div>
              
              <form onSubmit={handleAddEditIndustry} className="p-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="industryName" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry Name
                  </label>
                  <input 
                    id="industryName"
                    type="text" 
                    value={industryName} 
                    onChange={(e) => setIndustryName(e.target.value)} 
                    placeholder="Enter industry name" 
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-blue-500 focus:border-blue-500" 
                    required 
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This will be used to categorize your services
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        Processing...
                      </>
                    ) : editMode ? 'Update Industry' : 'Add Industry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="border-b p-4">
                <h2 className="text-xl font-bold">Confirm Deletion</h2>
              </div>
              
              <div className="p-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete the industry: 
                  <span className="font-semibold ml-1">"{industryToDelete?.industry}"</span>?
                </p>
                <p className="text-red-600 mb-4">
                  This action cannot be undone and will permanently remove this industry.
                </p>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    onClick={() => setShowDeleteModal(false)} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        Deleting...
                      </>
                    ) : 'Delete Industry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}