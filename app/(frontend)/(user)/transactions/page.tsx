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
          items: [
            {
              name: bid.productId.productName,
              price: bid.bidAmount,
              quantity: 1,
            },
          ],
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      });

      const { sessionId } = await response.json();
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
        const res = await fetch(`/api/user/profile/${user?._id}`);
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

    if (user?._id) fetchBids();
  }, [user?._id]);

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

      setBids((prev) => prev.filter((b) => b._id !== bidId));
      setFilteredBids((prev) => prev.filter((b) => b._id !== bidId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete bid.');
    }
  };

  return (
    <FrontEndLayout>
      <Header />

      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg" style={{ marginTop: "200px" }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
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
          <p className="text-gray-500">No Transactions Found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">#</th>
                  <th className="px-4 py-2 border-b">Product</th>
                  <th className="px-4 py-2 border-b">Bid Amount</th>
                  <th className="px-4 py-2 border-b">Pixels</th>
                  <th className="px-4 py-2 border-b">Time</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                  <th className="px-4 py-2 border-b">Pay</th>


                </tr>
              </thead>
              <tbody>
                {filteredBids.map((bid, index) => (
                  <tr key={bid._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{index + 1}</td>
                    <td className="px-4 py-2 border-b">{bid?.productId?.productName}</td>
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
                        Revert
                      </button>
                    </td>

                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handlePayBid(bid)}
                        className="text-blue-600 hover:underline"
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Pay"}
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
