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
  status?: 'active' | 'sold' | 'expired';
  createdAt?: string;
  updatedAt?: string;
}

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    await connectDB();

    const product = await Product.findById(params.id).lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Type assertion to tell TypeScript about the structure
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
      status?: 'active' | 'sold' | 'expired';
      createdAt?: Date;
      updatedAt?: Date;
    };

    const processedProduct: ProductResponse = {
      ...typedProduct,
      _id: typedProduct._id.toString(),
      ownerId: typedProduct.ownerId?.toString(),
      createdAt: typedProduct.createdAt?.toISOString(),
      updatedAt: typedProduct.updatedAt?.toISOString(),
      expiryDate: typedProduct.expiryDate?.toISOString(),
    };

    return NextResponse.json(processedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}