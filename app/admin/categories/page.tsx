'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import Image from 'next/image';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Spinner } from '@/app/utills/Spinner';

interface Category {
  _id: string;
  category: string;
  image: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
    setIsLoading(false);
  };

  const handleAddEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const formData = new FormData();
    formData.append('category', categoryName);
    if (image) formData.append('image', image);

    const method = editMode ? 'PUT' : 'POST';
    const url = editMode ? `/api/categories?id=${selectedCategory?._id}` : '/api/categories';

    const res = await fetch(url, { method, body: formData });
    if (res.ok) {
      fetchCategories();
      closeModal();
    }
    setProcessing(false);
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      const res = await fetch(`/api/categories?id=${categoryToDelete._id}`, { method: 'DELETE' });
      if (res.ok) fetchCategories();
    }
    setShowDeleteModal(false);
  };

  const openModal = (category: Category | null = null) => {
    setSelectedCategory(category);
    setCategoryName(category ? category.category : '');
    setEditMode(!!category);
    setShowModal(true);
    setImagePreview(category ? category.image : null);
  };

  const closeModal = () => {
    setShowModal(false);
    setCategoryName('');
    setImage(null);
    setImagePreview(null);
    setEditMode(false);
    setProcessing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto p-6 bg-white shadow rounded-lg">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Categories</h1>
          <button onClick={() => openModal()} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
            <PlusIcon className="w-5 h-5 mr-1" /> Add Category
          </button>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">#</th>
            <th className="px-6 py-3 text-left">Category</th>
            <th className="px-6 py-3 text-center">Image</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={4} className="text-center py-4">
                <Spinner />
              </td>
            </tr>
          ) : (
            categories.map((category, index) => (
              <tr key={category._id} className="hover:bg-gray-100">
                <td className="px-6 py-4 text-left">{index + 1}</td>
                <td className="px-6 py-4 text-left">{category.category}</td>
                <td className="px-6 py-4 text-right">
                  <Image src={category.image} alt={category.category} width={50} height={50} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(category)} className="text-blue-500 mr-5">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => { setCategoryToDelete(category); setShowDeleteModal(true); }} className="text-red-500">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
       </table>

        {showModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Category' : 'Add Category'}</h2>
              <form onSubmit={handleAddEditCategory}>
                <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category Name" className="border p-4 w-full mb-4" required />
                <input type="file" onChange={handleImageChange} className="border p-2 w-full mb-4" />
                {imagePreview && <Image src={imagePreview} alt="Preview" width={100} height={100} className="mb-4" />}
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded mr-2" disabled={processing}>{processing ? 'Processing...' : 'Save'}</button>
                <button type="button" onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </form>
            </div>
          </div>
        )}


        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this category?</p>
              <div className="mt-4">
                <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded mr-2">Delete</button>
                <button onClick={() => setShowDeleteModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
