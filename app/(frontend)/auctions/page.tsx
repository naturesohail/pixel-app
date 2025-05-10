// "use client";

// import Timer from "@/app/components/Timer";
// import { useEffect, useState } from "react";
// import BidForm from "./bidForm";
// import ZoneBidsList from "./bidList";
// import Swal from "sweetalert2";
// import { useRouter } from "next/navigation";

// export default function PixelMarketplace() {
//   const userId = JSON.parse(localStorage.getItem("userData") || "")?._id;
//   const [loading, setLoading] = useState(false);
//   const [alreadyBided, setAlreadyBided] = useState(false);
//   const [activeAuctionZone, setActiveAuctionZone] = useState<any>(null);
//   const [config, setconfig] = useState();
//   const router = useRouter();
//   useEffect(() => {
//     async function fetchPixelData() {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/pixels");
//         const data = await response.json();

//         if (data.success && data.config) {
//           setconfig(data.config)
//           const activezone = (data.config.auctionZones || []).find(
//             (zone: any) => zone.status === "active"
//           );
//           if (!activezone) {
//             Swal.fire({
//               title: "No pixels available to buy",
//               text: "",
//               icon: "warning",
//               showCancelButton: true,
//               confirmButtonColor: "#4f46e5",
//               cancelButtonColor: "#d33",
//               confirmButtonText: "ok",
//             }).then((result) => {
//               router.push("/");
//             });
//           }
//           setActiveAuctionZone(activezone);
//         }
//       } catch (error) {
//         console.error("Error fetching pixel data:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchPixelData();
//   }, []);
//   // Countdown Timer
//   // const getMyBids = async (userId: string) => {
//   //   const response = await fetch(`/api/pixels/bid?userId=${userId}`);
//   //   const data = await response.json();

//   //   if (response.ok) {
//   //     console.log("✅ Your bids:", data.bids);
//   //   } else {
//   //     console.error("❌ Error fetching your bids:", data.error);
//   //   }
//   // };

//   // useEffect(()=>{
//   //   if(!userId) return
//   // getMyBids(userId)
//   // },[userId])

//   return (
//     <>
//       {loading ? (
//         <h1>loading</h1>
//       ) : (
//         <>
//           <ZoneBidsList
//             userId={userId}
//             zoneId={activeAuctionZone?._id || ""}
//             setAlreadyBided={setAlreadyBided}
//           />
//           {!alreadyBided && activeAuctionZone?._id && (
//             <BidForm config={config} activeAuctionZone={activeAuctionZone} />
//           )}
//         </>
//       )}
//     </>
//   );
// }


'use client';

import Timer from "@/app/components/Timer";
import { useEffect, useState } from "react";
import BidForm from "./bidForm";
import ZoneBidsList from "./bidList";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function PixelMarketplace() {
  const [userId, setUserId] = useState<string | "">("");
  const [loading, setLoading] = useState(false);
  const [alreadyBided, setAlreadyBided] = useState(false);
  const [activeAuctionZone, setActiveAuctionZone] = useState<any>(null);
  const [config, setconfig] = useState();
  const router = useRouter();

  useEffect(() => {
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
            (zone: any) => zone.status === "active"
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

  return (
    <>
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <ZoneBidsList
            userId={userId}
            zoneId={activeAuctionZone?._id || ""}
            setAlreadyBided={setAlreadyBided}
          />
          {!alreadyBided && activeAuctionZone?._id && (
            <BidForm config={config} activeAuctionZone={activeAuctionZone} />
          )}
        </>
      )}
    </>
  );
}
