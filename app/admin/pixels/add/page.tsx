// AddPixel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/utills/Button';
import AdminLayout from '@/app/layouts/AdminLayout';

export default function AddPixel() {
  const [pricePerPixel, setPricePerPixel] = useState('');
  const [oneTimePrice, setOneTimePrice] = useState('');
  const [totalPixels, setTotalPixels] = useState('');
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState('1'); // New state
  const [auctionWinDays, setAuctionWinDays] = useState('2'); // New state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const router = useRouter();

  // Fetch current config on mount
  useEffect(() => {
    const fetchCurrentConfig = async () => {
      try {
        const response = await fetch('/api/pixels');
        const data = await response.json();
        if (data.success && data.config) {
          setCurrentConfig(data.config);
          setMinimumOrderQuantity(data.config.minimumOrderQuantity?.toString() || '1');
          setAuctionWinDays(data.config.auctionWinDays?.toString() || '2');
        }
      } catch (error) {
        console.error('Error fetching current config:', error);
      }
    };

    fetchCurrentConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/pixels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pricePerPixel: parseFloat(pricePerPixel),
          oneTimePrice: parseFloat(oneTimePrice),
          totalPixels: parseInt(totalPixels),
          minimumOrderQuantity: parseInt(minimumOrderQuantity), // New field
          auctionWinDays: parseInt(auctionWinDays) // New field
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update configuration');
      }

      router.push('/admin/pixels');
    } catch (error) {
      console.error('Error submitting pixel configuration:', error);
      setError(error instanceof Error ? error.message : 'Failed to update configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {currentConfig ? 'Update Pixel Configuration' : 'Add New Pixel Configuration'}
          </h2>
          
          {currentConfig && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Current Configuration</h3>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-600">Price per Pixel</p>
                  <p className="font-medium">${currentConfig.pricePerPixel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">One-Time Price</p>
                  <p className="font-medium">${currentConfig.oneTimePrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pixels</p>
                  <p className="font-medium">{currentConfig.totalPixels.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Min Order Qty</p>
                  <p className="font-medium">{currentConfig.minimumOrderQuantity || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Auction Win Days</p>
                  <p className="font-medium">{currentConfig.auctionWinDays || 2}</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <div>
                <label className="text-sm font-medium text-gray-700">Price per Pixel ($)</label>
                <input 
                  type="number" 
                  value={pricePerPixel} 
                  onChange={(e) => setPricePerPixel(e.target.value)} 
                  className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" 
                  required 
                  placeholder={currentConfig?.pricePerPixel || "Enter price per pixel"} 
                  step="0.01"
                  min="0.01"
                />
              </div> */}

              {/* <div>
                <label className="text-sm font-medium text-gray-700">One-Time Price ($)</label>
                <input 
                  type="number" 
                  value={oneTimePrice} 
                  onChange={(e) => setOneTimePrice(e.target.value)} 
                  className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" 
                  required 
                  placeholder={currentConfig?.oneTimePrice || "Enter one-time price"} 
                  step="0.01"
                  min="0.01"
                />
              </div> */}

              <div>
                <label className="text-sm font-medium text-gray-700">Total Pixels Available</label>
                <input 
                  type="number" 
                  value={totalPixels} 
                  onChange={(e) => setTotalPixels(e.target.value)} 
                  className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" 
                  required 
                  placeholder={currentConfig?.totalPixels || "Enter total pixels"} 
                  min="1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Minimum Order Quantity</label>
                <input 
                  type="number" 
                  value={minimumOrderQuantity} 
                  onChange={(e) => setMinimumOrderQuantity(e.target.value)} 
                  className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" 
                  required 
                  min="1"
                  placeholder="Minimum pixels user can buy"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum number of pixels a user must purchase</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Auction Win Days</label>
                <input 
                  type="number" 
                  value={auctionWinDays} 
                  onChange={(e) => setAuctionWinDays(e.target.value)} 
                  className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" 
                  required 
                  min="1"
                  placeholder="Days until auction automatically wins"
                />
                <p className="mt-1 text-xs text-gray-500">Days after which highest bid automatically wins</p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                onClick={() => router.push('/admin/pixels')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}