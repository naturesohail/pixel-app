'use client';
import React, { useState, useEffect } from 'react';
import FrontEndLayout from '@/app/layouts/FrontendLayout';
import { Spinner } from '@/app/utills/Spinner';
import { Bid } from "@/app/types/bidTypes";
import Header from '@/app/components/Header';
import { useAuth } from '@/app/context/AuthContext';
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51R7u7XFWt2YrxyZwQ7kODs2zn8kBC3rbqOf8bU4JfAvtyyWpd96TYtikYji8oyP04uClsnEqxlg0ApdiImX4Xhtm00NGDkbha9");

export default function ProductBidsView() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`/api/user/profile/${user?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      const updatedUser = await res.json();

      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  

  useEffect(() => {
    async function fetchBids() {
      try {
        const res = await fetch(`/api/user/profile/${user?._id}`);
        if (!res.ok) throw new Error('Failed to fetch bids');
        const data: Bid[] = await res.json();
        setBids(data);
      } catch (err) {
        console.error('Error loading bids:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user?._id) fetchBids();
  }, [user?._id]);

  return (
    <FrontEndLayout>
      <Header />

      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg" style={{ marginTop: "200px" }}>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
            {editMode ? (
              <div className="space-x-2">
                <button onClick={handleSaveProfile} className="text-green-600 hover:underline">Save</button>
                <button onClick={() => setEditMode(false)} className="text-gray-500 hover:underline">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)} className="text-blue-600 hover:underline">Edit</button>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <div>
              <label className="block font-medium">Name:</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                readOnly={!editMode}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <div>
              <label className="block font-medium">Email:</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                readOnly={!editMode}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <div>
              <label className="block font-medium">Phone:</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                readOnly={!editMode}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
          </div>
        </div>

      
      </div>
    </FrontEndLayout>
  );
}
