'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import FrontEndLayout from '@/app/layouts/FrontendLayout';
import Header from '@/app/components/Header';
import { Spinner } from '@/app/utills/Spinner';
import { useAuth } from '@/app/context/AuthContext';

interface AuctionZone {
  _id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: string;
  buyNowPrice?: number;
  totalPixels: number;
  expiryDate?: string;
  createdAt: string;
}

export default function MyAuctionZones() {
  const { user } = useAuth();
  const [zones, setZones] = useState<AuctionZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyZones() {
      try {
        const res = await fetch(
          `/api/my-bids?userId=${user?._id}`
        );

        if (!res.ok) throw new Error('Failed to fetch zones');

        const data = await res.json();
        setZones(data.auctionZones || []);
      } catch (error) {
        console.error('Error fetching my zones:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user?._id) {
      fetchMyZones();
    }
  }, [user?._id]);

  return (
    <FrontEndLayout>
      <Header />

      <div
        className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg"
        style={{ marginTop: '200px' }}
      >
        <h1 className="text-2xl font-bold mb-6">My Bids</h1>

        {isLoading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : zones.length === 0 ? (
          <p className="text-gray-500">
            You have not placed bid yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <Link
                key={zone._id}
                href={`/auctions/${zone._id}`}
                className="block border rounded-lg p-4 shadow-sm hover:shadow-lg hover:scale-[1.02] transition duration-200 cursor-pointer"
              >
                {/* <h2 className="font-semibold text-lg mb-2">
                  Zone #{zone._id.slice(-6)}
                </h2> */}

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Position:</strong> ({zone.x}, {zone.y})
                  </p>
                  <p>
                    <strong>Size:</strong> {zone.width} × {zone.height}
                  </p>
                  <p>
                    <strong>Total Pixels:</strong> {zone.totalPixels}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        zone.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : zone.status === 'sold'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {zone.status}
                    </span>
                  </p>

                  {zone.buyNowPrice && (
                    <p>
                      <strong>Buy Now:</strong> ${zone.buyNowPrice}
                    </p>
                  )}

                  {zone.expiryDate && (
                    <p>
                      <strong>Expires:</strong>{' '}
                      {new Date(zone.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FrontEndLayout>
  );
}
