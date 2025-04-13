// EditPixel.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/app/utills/Button';
import AdminLayout from '@/app/layouts/AdminLayout';

interface PixelConfig {
  _id: string;
  pricePerPixel: number;
  oneTimePrice: number;
  totalPixels: number;
  availablePixels: number;
  minimumOrderQuantity: number;
  auctionWinDays: number;
}

export default function EditPixel() {
  const [config, setConfig] = useState<PixelConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [pricePerPixel, setPricePerPixel] = useState('');
  const [oneTimePrice, setOneTimePrice] = useState('');
  const [totalPixels, setTotalPixels] = useState('');
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState('1');
  const [auctionWinDays, setAuctionWinDays] = useState('2');

  useEffect(() => {
    async function fetchConfig() {
      if (!id) return;
      try {
        const res = await fetch(`/api/pixels?id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch configuration');
        
        const data = await res.json();
        if (!data.success || !data.config) {
          throw new Error('Configuration not found');
        }
        
        setConfig(data.config);
        setPricePerPixel(data.config.pricePerPixel.toString());
        setOneTimePrice(data.config.oneTimePrice.toString());
        setTotalPixels(data.config.totalPixels.toString());
        setMinimumOrderQuantity(data.config.minimumOrderQuantity?.toString() || '1');
        setAuctionWinDays(data.config.auctionWinDays?.toString() || '2');
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load configuration');
      }
    }

    fetchConfig();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/pixels?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pricePerPixel: parseFloat(pricePerPixel),
          oneTimePrice: parseFloat(oneTimePrice),
          totalPixels: parseInt(totalPixels),
          minimumOrderQuantity: parseInt(minimumOrderQuantity),
          auctionWinDays: parseInt(auctionWinDays)
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update configuration');
      }

      router.push('/admin/pixels');
    } catch (error) {
      console.error('Error:', error);
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
            {config ? 'Edit Configuration' : 'Loading Configuration...'}
          </h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {config && (
            <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Price per Pixel ($)</label>
                  <input 
                    type="number" 
                    value={pricePerPixel} 
                    onChange={(e) => setPricePerPixel(e.target.value)} 
                    className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" 
                    required 
                    step="0.01"
                    min="0.01"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">One-Time Price ($)</label>
                  <input 
                    type="number" 
                    value={oneTimePrice} 
                    onChange={(e) => setOneTimePrice(e.target.value)} 
                    className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" 
                    required 
                    step="0.01"
                    min="0.01"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Total Pixels</label>
                  <input 
                    type="number" 
                    value={totalPixels} 
                    onChange={(e) => setTotalPixels(e.target.value)} 
                    className="mt-1 w-full rounded-lg border px-4 py-2 shadow-sm" 
                    required 
                    min="1"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Currently available: {config.availablePixels.toLocaleString()} pixels
                  </p>
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
                  {isSubmitting ? 'Updating...' : 'Update Configuration'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}