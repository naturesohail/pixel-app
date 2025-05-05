import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import PixelConfig from '@/app/lib/models/pixelModel';
import Product from '@/app/lib/models/productModel';
import dbConnect from '@/app/lib/db';
import { Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";

cloudinary.config({
  cloud_name: "dtc1nqk9g",
  api_key: "988391113487354",
  api_secret: "o8IkkQeCn8vFEmG2gI6saI1R6mo",
});



const stripe = new Stripe("sk_test_51R7u7XFWt2YrxyZwTMNvSl4gAgizA6e01XBp4sQGhLFId0qKAH1QdI2jFhlaFtHU9sMuPNHh8XvhB7DDQlfCnYiw00GsRA8POr", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  let processedImages: string[] = [];
  let dbSession: any;
  let connection; 

  try {
    connection = await dbConnect();
    if (!connection || mongoose.connection.readyState !== 1) {
      throw new Error('Failed to connect to the database');
    }


    dbSession = await connection.startSession();
    dbSession.startTransaction();

    const { userId, pixelCount, totalPrice, productData, isOneTimePurchase } = await request.json();

    
    if (!Types.ObjectId.isValid(userId) || !pixelCount || !productData) {
      throw new Error('Missing required fields');
    }

    const config = await PixelConfig.findOne().sort({ createdAt: -1 }).session(dbSession);
    if (!config) {
      throw new Error('Pixel configuration not found');
    }

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
      throw new Error('At least one valid image is required');
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 
    365);

    let allocatedPixelIndices: number[] = [];
    if (config.auctionZones) {
      const availableAuctionPixels = config.auctionZones.reduce((acc: number[], zone: any) => {
        if (zone.pixelIndices) {
          acc.push(...zone.pixelIndices);
        }
        return acc;
      }, []);

      const allUsedIndices = new Set<number>();
      const existingProducts = await Product.find({}).session(dbSession);
      existingProducts.forEach(p => {
        p.pixelIndices?.forEach((index: any) => allUsedIndices.add(index));
      });

      const allocatableFromAuction = availableAuctionPixels.filter((index:any) => !allUsedIndices.has(index));
      allocatedPixelIndices = allocatableFromAuction.slice(0, pixelCount);

      if (allocatedPixelIndices.length < pixelCount) {
        throw new Error(`Not enough available pixels (${allocatedPixelIndices.length}/${pixelCount})`);
      }

      config.auctionZones = config.auctionZones.map((zone: any) => ({
        ...zone,
        pixelIndices: zone.pixelIndices?.filter((index: number) => !allocatedPixelIndices.includes(index)),
        isEmpty: zone.pixelIndices?.filter((index: number) => !allocatedPixelIndices.includes(index)).length === 0,
      }));
    } else if (pixelCount > 0) {
      throw new Error('No auction zones configured');
    }

    const product = await Product.create([{
      title: productData.title,
      description: productData.description,
      price: totalPrice,
      category: productData.category || 'other',
      images: processedImages,
      url: productData.url || '',
      owner: new Types.ObjectId(userId),
      pixelCount,
      pixelIndices: allocatedPixelIndices,
      status: "pending",
      purchaseType: isOneTimePurchase ? 'one-time' : 'bid',
      pixelIndex: allocatedPixelIndices[0] || null,
      expiryDate
    }], { session: dbSession });

    await config.save({ session: dbSession });

    const stripeSession = await stripe.checkout.sessions.create({
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}&product_id=${product[0]._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel?product_id=${product[0]._id}`,
      metadata: {
        userId,
        pixelCount: pixelCount.toString(),
        productId: product[0]._id.toString(),
        isOneTimePurchase: isOneTimePurchase.toString()
      }
    });

    if (!stripeSession.id) {
      throw new Error('Failed to create Stripe session');
    }

    await dbSession.commitTransaction();
    return NextResponse.json({ id: stripeSession.id });

  } catch (error) {
    if (dbSession) {
      await dbSession.abortTransaction();
    }
    console.error('Checkout error:', error);

    if (processedImages?.length > 0) {
      await Promise.all(processedImages.map(async (img) => {
        if (img.includes('res.cloudinary.com')) {
          try {
            const publicId = img.split('/').pop()?.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(publicId);
          } catch (e) {
            console.error('Failed to cleanup image:', e);
          }
        }
      }));
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Payment processing failed',
        rolledBack: true
      },
      { status: 500 }
    );
  } finally {
    if (dbSession) {
      dbSession.endSession();
    }
  }
}