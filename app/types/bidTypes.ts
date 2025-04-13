
export interface Bid {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  productId: {
    _id: string;
    productName: string;
    categories:string
  };
  title:any;
  category:any;
  url:any;
  description:any;
  images:any;
  totalPixels: number;
  bidAmount: number;
  pixelCount:any;
  status: string;
  createdAt: string;
}