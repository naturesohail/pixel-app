export interface Product {
  _id: string;
  productName: string;
  categories: string;
  price: any;
  description: string;
  productStatus: string;
  image: any;
  categoryId?: any;
  status?: any;
  categoryName?: any;
  auctionType: any;
  biddingEndTime: any;
  totalPixel: any;
  pixelBid: any;
  soldPixels: number;
  pricePerPixel?: number;
  ownerName?: string;
  url?: string; // URL to open when pixel is clicked


}

export interface Pixel{
  pricePerPixel:any;
  pixels:any;
  totalPixels:any
}
export interface FeaturedProjectProps {
  className?: string;
  properties: Product[];

}