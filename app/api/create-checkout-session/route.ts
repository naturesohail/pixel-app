import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import PixelConfig from '@/app/lib/models/pixelModel';
import Product from '@/app/lib/models/productModel';
import dbConnect from '@/app/lib/db';
import { Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: "dtc1nqk9g",
  api_key: "988391113487354",
  api_secret: "o8IkkQeCn8vFEmG2gI6saI1R6mo",
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (isOneTimePurchase ? 365 : 30));

    let allocatedPixelIndices: number[] = [];

    if (config.auctionZones) {
      const availableAuctionPixels = config.auctionZones.reduce((acc: number[], zone: any) => {
        if (zone.pixelIndices) {
          acc.push(...zone.pixelIndices);
        }
        return acc;
      }, []);

      const allUsedIndices = new Set<number>();
      const existingProducts = await Product.find({});
      existingProducts.forEach(p => {
        p.pixelIndices?.forEach((index: any) => allUsedIndices.add(index));
      });

      const allocatableFromAuction = availableAuctionPixels.filter((index:any) => !allUsedIndices.has(index));

      allocatedPixelIndices = allocatableFromAuction.slice(0, pixelCount);

      if (allocatedPixelIndices.length < pixelCount) {
        return NextResponse.json(
          { error: `Not enough available pixels in auction zones (${allocatedPixelIndices.length}/${pixelCount})` },
          { status: 400 }
        );
      }
    } else if (pixelCount > 0) {
      return NextResponse.json(
        { error: 'No auction zones configured to allocate pixels from.' },
        { status: 400 }
      );
    }


    // Create the product
    const product = new Product({
      title: productData.title,
      description: productData.description,
      price: totalPrice,
      category: productData.category || 'other',
      images: processedImages,
      url: productData.url || '',
      owner: new Types.ObjectId(userId),
      pixelCount,
      pixelIndices: allocatedPixelIndices,
      status: "won",
      purchaseType: isOneTimePurchase ? 'one-time' : 'bid',
      pixelIndex: allocatedPixelIndices[0] || null, // For backward compatibility
      expiryDate
    });

    await product.save();

    // Update available pixels count (we are allocating from zones, so no direct decrement here)

    // Remove allocated pixels from auction zones
    if (config.auctionZones) {
      config.auctionZones = config.auctionZones.map((zone: any) => ({
        ...zone,
        pixelIndices: zone.pixelIndices?.filter((index: number) => !allocatedPixelIndices.includes(index)),
        isEmpty: zone.pixelIndices?.filter((index: number) => !allocatedPixelIndices.includes(index)).length === 0,
      }));
    }

    await config.save();

    // Create Stripe checkout session (same as before)
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