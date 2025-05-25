"use client";

import Timer from "@/app/components/Timer";
import { useEffect, useState } from "react";
import BidForm from "./bidForm";
import ZoneBidsList from "./bidList";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

type Props = {
  params: {
    id: string;
  };
};
export default function PixelMarketplace({ params }: any) {
  const [userId, setUserId] = useState<string | "">("");
  const [loading, setLoading] = useState(false);
  const [alreadyBided, setAlreadyBided] = useState(false);
  const [activeAuctionZone, setActiveAuctionZone] = useState<any>(null);
  const [config, setconfig] = useState();
  const router = useRouter();
  const zoneId: string = params.id;
  console.log("alreadyBided :>> ", zoneId);
  useEffect(() => {
    if (!zoneId) {
       Swal.fire({
        title: "No pixels available to buy",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK",
      }).then(() => {
        router.push("/");
      });
      return
    }

    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserId(parsed?._id || null);
      } catch (err) {
        console.error("Failed to parse userData:", err);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchPixelData() {
      try {
        setLoading(true);
        const response = await fetch("/api/pixels");
        const data = await response.json();

        if (data.success && data.config) {
          setconfig(data.config);
          const activezone = (data.config.auctionZones || []).find(
            (zone: any) => {
              return zone._id === zoneId;
            }
          );
          if (!activezone) {
            Swal.fire({
              title: "No pixels available to buy",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#4f46e5",
              cancelButtonColor: "#d33",
              confirmButtonText: "OK",
            }).then(() => {
              router.push("/");
            });
          }
          setActiveAuctionZone(activezone);
        }
      } catch (error) {
        console.error("Error fetching pixel data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPixelData();
  }, [router]);
  console.log("activeAuctionZone :>> ", activeAuctionZone);
  return (
    <>
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          {zoneId && (
            <ZoneBidsList
              userId={userId}
              zoneId={zoneId}
              setAlreadyBided={setAlreadyBided}
            />
          )}

          {!alreadyBided && activeAuctionZone?._id && (
            <BidForm config={config} activeAuctionZone={activeAuctionZone} />
          )}
        </>
      )}
    </>
  );
}
