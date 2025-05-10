import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Product from '@/app/lib/models/productModel';
import { Types } from 'mongoose';

interface ProductResponse {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  url?: string;
  ownerId?: string;
  pixelIndex?: number;
  expiryDate?: string;
  pixelCount?: number;
  purchaseType?: 'one-time' | 'bid';
  status?: 'active' | 'sold' | 'expired' | 'won';
  createdAt?: string;
  updatedAt?: string;
}

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    await connectDB();

    const products = await Product.find({ ownerId: params.userId })
    .sort({ createdAt: -1 })  
    .lean();
    const processedProducts: ProductResponse[] = products.map(product => {
      const typedProduct = product as unknown as {
        _id: Types.ObjectId;
        title: string;
        description: string;
        price: number;
        category: string;
        images: string[];
        url?: string;
        ownerId?: Types.ObjectId;
        pixelIndex?: number;
        expiryDate?: Date;
        pixelCount?: number;
        purchaseType?: 'one-time' | 'bid';
        status?: 'active' | 'sold' | 'expired' | 'won';
        createdAt?: Date;
        updatedAt?: Date;
      };

      return {
        ...typedProduct,
        _id: typedProduct._id.toString(),
        ownerId: typedProduct.ownerId?.toString(),
        createdAt: typedProduct.createdAt?.toISOString(),
        updatedAt: typedProduct.updatedAt?.toISOString(),
        expiryDate: typedProduct.expiryDate?.toISOString(),
      };
    });

    return NextResponse.json(processedProducts);
  } catch (error) {
    console.error('Error fetching user products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user products' },
      { status: 500 }
    );
  }
}