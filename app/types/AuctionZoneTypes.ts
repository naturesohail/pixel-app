
import { Product } from "./productTypes";
export interface AuctionZone {
  _id?: string;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  products: Product[];
  isEmpty: boolean;
  status: "active" | "sold" | "expired";
  currentBid?: number;
  currentBidder?: string;
  buyNowPrice?: number;
  auctionEndDate?: string;
  totalPixels?: number;
  pixelPrice?: number;
}
