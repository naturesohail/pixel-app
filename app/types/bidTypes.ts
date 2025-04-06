
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
  totalPixels: number;
  bidAmount: number;
  status: string;
  createdAt: string;
}