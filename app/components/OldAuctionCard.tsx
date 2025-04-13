// // components/AuctionCard.tsx
// "use client";
// import Image from "next/image";
// import { Product } from "@/app/types/productTypes";

// type Props = {
//   item: Product;
//   timeLeft: number;
//   boxSize: number;
//   pixelPage: number;
//   pixelsPerPage: number;
//   onPrevPage: () => void;
//   onNextPage: () => void;
// };

// export default function AuctionCard({
//   item,
//   timeLeft,
//   boxSize,
//   pixelPage,
//   pixelsPerPage,
//   onPrevPage,
//   onNextPage,
// }: Props) {
//   const formatTime = (seconds: number) => {
//     if (seconds <= 0) return "Auction Ended";
//     const days = Math.floor(seconds / (24 * 3600));
//     const hours = Math.floor((seconds % (24 * 3600)) / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     return `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${secs}s`;
//   };

//   return (
//     <div className="col-lg-4 mb-4">
//       <div className="right-first-image">
//         <div className="thumb position-relative">
//           <div className="inner-content">
//             <h4>{item.productName}</h4>
//             <span>{item.description}</span>
//             <p className="text-white font-bold">Time Left: {formatTime(timeLeft)}</p>
//             <div className="main-border-button">
//               <a href="#">Start Bidding</a>
//             </div>
//           </div>

//           <div className="hover-content">
//             <div className="inner">
//               <h4>{item.productName}</h4>
//               <p>{item.description}</p>
//               <div className="main-border-button">
//                 <a href={`/products/${item._id}`}>View Auctions</a>
//               </div>
//             </div>
//           </div>

//           <Image
//             src={item.image}
//             alt={item.productName}
//             width={260}
//             height={200}
//             className="image-container"
//           />
//         </div>

//         <p className="d-flex flex-wrap gap-2 mt-3">
//           <span className="d-flex">Available pixel</span>
//           {item.totalPixel > 0 && (
//             <div
//               style={{
//                 width: "600px",
//                 height: "200px",
//                 display: "grid",
//                 gridTemplateColumns: `repeat(${Math.floor(600 / boxSize)}, ${boxSize}px)`,
//                 gridTemplateRows: `repeat(${Math.floor(450 / boxSize)}, ${boxSize}px)`,
//                 gap: "0px",
//                 overflow: "hidden",
//               }}
//             >
//               {Array.from({ length: pixelsPerPage }).map((_, index) =>
//                 index + pixelPage * pixelsPerPage < item.totalPixel ? (
//                   <div
//                     key={index}
//                     style={{
//                       width: `${boxSize}px`,
//                       height: `${boxSize}px`,
//                       backgroundColor: "#fff",
//                       border: "0.5px solid #999",
//                     }}
//                   ></div>
//                 ) : null
//               )}
//             </div>
//           )}
//         </p>

//         <div>
//           <button
//             className="btn btn-sm btn-secondary me-2"
//             onClick={onPrevPage}
//             disabled={pixelPage === 0}
//           >
//             Prev
//           </button>
//           <span>
//             {pixelPage + 1}/{Math.ceil(item.totalPixel / pixelsPerPage)}
//           </span>
//           <button
//             className="btn btn-sm btn-secondary ms-2"
//             onClick={onNextPage}
//             disabled={(pixelPage + 1) * pixelsPerPage >= item.totalPixel}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

