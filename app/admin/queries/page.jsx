"use client"
import React, { useState } from 'react';
import AdminLayout from "@/app/layouts/AdminLayout";
import { Dialog, Transition } from '@headlessui/react';

const queries = [
  {
    id: 1,
    property: 'Property 1',
    name: 'John Doe',
    status: 'Active',
  },
  {
    id: 2,
    property: 'Property 2',
    name: 'Jane Smith',
    status: 'Inactive',
  },
  {
    id: 3,
    property: 'Property 3',
    name: 'John Doe',
    status: 'Active',
  },
];

export default function Queries() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const openModal = (query) => {
    setSelectedQuery(query);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuery(null);
  };

  const handleDelete = () => {
    console.log("Deleted query: ", selectedQuery);
    closeModal();
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Queries</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queries.map((query, index) => (
                <tr key={query.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{query.property}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{query.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{query.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openModal(query)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      <Transition show={isModalOpen}>
        <Dialog onClose={closeModal} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 fixed inset-0" aria-hidden="true" />
          <div className="bg-white rounded-lg p-6 shadow-lg z-50 max-w-sm mx-auto">
            <Dialog.Title className="text-lg font-bold">Confirm Deletion</Dialog.Title>
            <p className="mt-2">Are you sure you want to delete "{selectedQuery?.property}"?</p>
            <div className="mt-4 flex justify-end space-x-3">
              <button className="px-4 py-2 bg-gray-200 rounded-lg" onClick={closeModal}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </Dialog>
      </Transition>
    </AdminLayout>
  );
}
