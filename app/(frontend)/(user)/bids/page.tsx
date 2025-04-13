'use client';
import React, { useState, useEffect } from 'react';
import FrontEndLayout from '@/app/layouts/FrontendLayout';
import { Spinner } from '@/app/utills/Spinner';
import { Bid } from "@/app/types/bidTypes"
import Header from '@/app/components/Header';
import { useAuth } from '@/app/context/AuthContext';
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51R7u7XFWt2YrxyZwQ7kODs2zn8kBC3rbqOf8bU4JfAvtyyWpd96TYtikYji8oyP04uClsnEqxlg0ApdiImX4Xhtm00NGDkbha9");

export default function ProductBidsView() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [filteredBids, setFilteredBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePayBid = async (bid: Bid) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({

          bidId: bid?._id,
          userId: user?._id,
          pixelCount: bid.pixelCount || 0, // Make sure to include pixelCount
          totalPrice: bid.bidAmount,
          productData: {
            title: bid?.title || "Bid Payment",
            description: bid?.description || "",
            images: bid?.images || [],
            category: bid?.category || "other",
            url: bid?.url || ""
          },
          isOneTimePurchase: false // Since this is for bid payment
        }),
      });
  
      const { id: sessionId } = await response.json();
      const stripe = await stripePromise;
      if (stripe) await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error initiating payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    async function fetchBids() {
      try {
        if (!user?._id) return;
        
        const res = await fetch(`/api/bids/user/${user._id}`);
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

    fetchBids();
  }, [user?._id]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredBids(
      bids.filter(bid => 
        bid.productId?.productName?.toLowerCase().includes(value) ||
        bid.bidAmount.toString().includes(value)
      )
    );
  };

  const handleDelete = async (bidId: string) => {
    if (!confirm('Are you sure you want to delete this bid?')) return;

    try {
      const res = await fetch(`/api/bids/${bidId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete bid');

      setBids(prev => prev.filter(b => b._id !== bidId));
      setFilteredBids(prev => prev.filter(b => b._id !== bidId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete bid.');
    }
  };

  return (
    <FrontEndLayout>
      <Header />
      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-40">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Bids</h1>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by product or amount"
            className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:ring"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : filteredBids.length === 0 ? (
          <p className="text-gray-500">No bids found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">#</th>
                  <th className="px-4 py-2 border-b">Product</th>
                  <th className="px-4 py-2 border-b">Bid Amount</th>
                  <th className="px-4 py-2 border-b">Pixels</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Time</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids.map((bid, index) => (
                  <tr key={bid._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{index + 1}</td>
                    <td className="px-4 py-2 border-b">
                      {bid?.title || 'N/A'}
                    </td>
                    <td className="px-4 py-2 border-b">
                      ${bid.bidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {bid?.pixelCount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bid.status === 'approved' ? 'bg-green-100 text-green-800' :
                        bid.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bid.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {new Date(bid.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b space-x-2">
                      {bid.status === 'approved' && (
                        <button
                          onClick={() => handlePayBid(bid)}
                          disabled={isProcessing}
                          className="text-blue-600 hover:underline disabled:opacity-50"
                        >
                          {isProcessing ? "Processing..." : "Pay Now"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(bid._id)}
                        className="text-red-600 hover:underline"
                      >
                        Revert 
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FrontEndLayout>
  );
}