
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import PixelConfig from '@/app/lib/models/pixelModel';
import Product from '@/app/lib/models/productModel';
import Bid from '@/app/lib/models/bidModel';

import dbConnect from '@/app/lib/db';
import { Types } from 'mongoose';

const stripe = new Stripe("sk_test_51R7u7XFWt2YrxyZwTMNvSl4gAgizA6e01XBp4sQGhLFId0qKAH1QdI2jFhlaFtHU9sMuPNHh8XvhB7DDQlfCnYiw00GsRA8POr", {
  apiVersion: "2025-02-24.acacia",
});

interface ProductData {
  title?: string;
  description?: string;
  images?: string[];
  category?: string;
  url?: string;
}

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const { 
      userId, 
      bidId,
      pixelCount, 
      totalPrice, 
      productData = {}, 
      isOneTimePurchase = false 
    } = await request.json() as {
      userId: string;
      bidId: string;
      pixelCount: number;
      totalPrice: number;
      productData?: ProductData;
      isOneTimePurchase?: boolean;
    };
    
    // Validate required fields
    if (!Types.ObjectId.isValid(userId) || !pixelCount || typeof totalPrice !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Get pixel config
    const config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }
  
    // Calculate expiry date (1 year for one-time, 1 month for bids)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (isOneTimePurchase ? 365 : 30));

    // Get next available pixel index
    const lastProduct = await Product.findOne().sort({ pixelIndex: -1 });
    const nextPixelIndex = (lastProduct?.pixelIndex ?? -1) + 1;

    // Create product with validated data
    const product = new Product({
      title: productData.title || 'Untitled Product',
      description: productData.description || '',
      price: totalPrice,
      category: productData.category || 'other',
      images: Array.isArray(productData.images) ? productData.images : [],
      url: productData.url || '',
      owner: new Types.ObjectId(userId),
      pixelCount,
      status: "won",
      purchaseType: isOneTimePurchase ? 'one-time' : 'bid',
      pixelIndex: nextPixelIndex,
      expiryDate
    });

   
  
    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            description: product.description || `${pixelCount} Pixel${pixelCount !== 1 ? 's' : ''}`
          },
          unit_amount: Math.round(totalPrice * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel?productId=${product._id}`,
      metadata: {
        userId,
        pixelCount: pixelCount.toString(),
        productId: product._id.toString(),
        isOneTimePurchase: isOneTimePurchase.toString()
      }
    });

    
    await product.save();

    // Delete The Bid
    const deleteBid = await Bid.findByIdAndDelete(bidId);
    if (!deleteBid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ id: session.id });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}