import Timer from "@/app/components/Timer";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Bid {
  _id: string;
  title: string;
  description: string;
  bidAmount: number;
  pixelCount: number;
  status: string;
  createdAt: string;
  isOneTimePurchase: boolean;
  images: string[];
  url?: string;
  winStatus: boolean;
  userId: string;
  resultTime: number;
}

interface Props {
  zoneId: string;
  setAlreadyBided: Dispatch<SetStateAction<boolean>>;
  userId: string;
}

export default function ZoneBidsList({
  zoneId,
  setAlreadyBided,
  userId,
}: Props) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getBidsForZone = async (zoneId: string) => {
    try {
      const res = await fetch(`/api/pixels/bid/zone?zoneId=${zoneId}`);
      const data = await res.json();
      console.log(data);
      setBids(data.bids);
      setAlreadyBided(data.bids.some((bid: any) => bid.userId === userId));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!zoneId) return;
    getBidsForZone(zoneId);
  }, [zoneId]);

  if (loading) return <p className="text-gray-500">Loading your bids...</p>;

  if (!bids.length) return <p className="text-gray-600">No bids found.</p>;

  return (
    <div className="grid grid-cols-1 gap-4 mt-6">
      {bids.map((bid) => (
        <div key={bid._id} className="p-4 rounded-xl shadow border bg-white">
          <div className="flex items-start gap-4">
            {bid.images?.[0] ? (
              <img
                src={bid.images[0]}
                alt={bid.title}
                className="w-20 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500">
                No Image
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-lg font-semibold">{bid.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {bid.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-700">
                <span>
                  <strong>${bid.bidAmount}</strong>
                </span>
                <span>🧩 {bid.pixelCount} px</span>
                <span>
                  Status: <span className="font-medium">{bid.status}</span>
                </span>
                <span>{new Date(bid.createdAt).toLocaleString()}</span>
                {bid.isOneTimePurchase && (
                  <span className="text-green-600 font-medium">Buy Now</span>
                )}
              </div>
              <Timer endTime={bid.resultTime} />
              {bid.winStatus && bid.userId === userId && (
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("buy-it-now?as=bid");
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-1 inline-block"
                >
                  Pay Now →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
