import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import PixelConfig from '@/app/lib/models/pixelModel';
import Product from '@/app/lib/models/productModel';
import dbConnect from '@/app/lib/db';
import { Types, Document } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: "dtc1nqk9g",
  api_key: "988391113487354",
  api_secret: "o8IkkQeCn8vFEmG2gI6saI1R6mo",
});

const stripe = new Stripe("sk_test_51R7u7XFWt2YrxyZwTMNvSl4gAgizA6e01XBp4sQGhLFId0qKAH1QdI2jFhlaFtHU9sMuPNHh8XvhB7DDQlfCnYiw00GsRA8POr", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const { userId, pixelCount, totalPrice, productData, isOneTimePurchase } = await request.json();
    
    if (!Types.ObjectId.isValid(userId) || !pixelCount || !productData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }

    if (config.availablePixels < pixelCount) {
      return NextResponse.json(
        { error: 'Not enough pixels available' },
        { status: 400 }
      );
    }

    let processedImages: string[] = [];
    if (Array.isArray(productData.images)) {
      for (const image of productData.images) {
        if (image.startsWith('data:image')) {
          try {
            const result = await cloudinary.uploader.upload(image, {
              folder: `pixel-products/${userId}`,
            });
            processedImages.push(result.secure_url);
          } catch (error) {
            console.error('Cloudinary upload error:', error);
            continue;
          }
        } else if (image.startsWith('http')) {
          processedImages.push(image);
        }
      }
    }

    if (processedImages.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid image is required' },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (isOneTimePurchase ? 365 : 30));

    // Get the next available pixel index with proper typing
    const lastProduct = await Product.findOne().sort({ pixelIndex: -1 }).lean<Document & { pixelIndex: number }>();
    const nextPixelIndex = (lastProduct?.pixelIndex ?? -1) + 1;

    const product = new Product({
      title: productData.title,
      description: productData.description,
      price: totalPrice,
      category: productData.category || 'other',
      images: processedImages,
      url: productData.url || '',
      owner: new Types.ObjectId(userId),
      pixelCount,
      status: "won",
      purchaseType: isOneTimePurchase ? 'one-time' : 'bid',
      pixelIndex: nextPixelIndex,
      expiryDate
    });

    await product.save();

    config.availablePixels -= pixelCount;
    await config.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${pixelCount} Pixel${pixelCount !== 1 ? 's' : ''}`,
            description: `Purchase of ${pixelCount} advertising pixels`
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

    return NextResponse.json({ id: session.id });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}