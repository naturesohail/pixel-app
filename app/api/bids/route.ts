import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Bid from "@/app/lib/models/bidModel";
import Product from "@/app/lib/models/productModel";
import PixelConfig from "@/app/lib/models/pixelModel";
import { Types } from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import Stripe from 'stripe';
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

    // Start session
    dbSession = await connection.startSession();
    dbSession.startTransaction();

    const { userId, pixelCount, bidAmount, product } = await request.json();

    // Validate inputs
    // if (!Types.ObjectId.isValid(userId) || !pixelCount || !product) {
    //   throw new Error('Missing required fields');
    // }

    // Get pixel config with active bid indices
    const config = await PixelConfig.findOne().sort({ createdAt: -1 }).session(dbSession);
    if (!config) {
      throw new Error('Pixel configuration not found');
    }

    // Process images
    if (Array.isArray(product.images)) {
      for (const image of product.images) {
        if (image.startsWith('data:image')) {
          try {
            const result = await cloudinary.uploader.upload(image, {
              folder: `pixel-bids/${userId}`,
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

    // Allocate pixel indices from auction zones
    let allocatedPixelIndices: number[] = [];
    let updatedZones = config.auctionZones.map((zone:any) => ({ ...zone }));

    // Find available indices not in activeBidIndices
    for (const zone of updatedZones) {
      if (zone.pixelIndices && zone.pixelIndices.length > 0) {
        const availableIndices = zone.pixelIndices.filter(
          (index:any) => !config.activeBidIndices.includes(index)
        );

        const needed = pixelCount - allocatedPixelIndices.length;
        if (needed > 0 && availableIndices.length > 0) {
          const indicesToAllocate = availableIndices.slice(0, needed);
          allocatedPixelIndices = [...allocatedPixelIndices, ...indicesToAllocate];
          
          // Remove allocated indices from zone
          zone.pixelIndices = zone.pixelIndices.filter(
            (index:any) => !indicesToAllocate.includes(index)
          );
          zone.isEmpty = zone.pixelIndices.length === 0;
        }
      }

      if (allocatedPixelIndices.length >= pixelCount) break;
    }

    if (allocatedPixelIndices.length < pixelCount) {
      throw new Error(`Not enough available pixels (${allocatedPixelIndices.length}/${pixelCount})`);
    }

    // Calculate expiry date (2 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + config.auctionWinDays);

    // Create the bid
    const bid = new Bid({
      title: product.title,
      description: product.description,
      images: processedImages,
      url: product.url,
      category: product.category || 'other',
      userId: new Types.ObjectId(userId),
      pixelCount,
      bidAmount,
      pixelIndices: allocatedPixelIndices,
      status: 'active',
      expiryDate,
      paymentStatus: 'pending'
    });

    await bid.save({ session: dbSession });

    // Update PixelConfig with new bid indices
    config.activeBidIndices = [...new Set([...config.activeBidIndices, ...allocatedPixelIndices])];
    
    // Update auction zones
    config.auctionZones = updatedZones;
    await config.save({ session: dbSession });

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${pixelCount} Pixel${pixelCount !== 1 ? 's' : ''} Bid`,
            description: `Bid for ${pixelCount} advertising pixels`
          },
          unit_amount: Math.round(bidAmount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bid-success?session_id={CHECKOUT_SESSION_ID}&bid_id=${bid._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bid-cancel?bid_id=${bid._id}`,
      metadata: {
        userId,
        pixelCount: pixelCount.toString(),
        bidId: bid._id.toString(),
        isBid: 'true'
      }
    });

    if (!stripeSession.id) {
      throw new Error('Failed to create Stripe session');
    }

    await dbSession.commitTransaction();
    return NextResponse.json({ 
      success: true,
      id: stripeSession.id,
      bid,
      message: `Bid placed for pixels ${allocatedPixelIndices.join(', ')}`
    });

  } catch (error) {
    if (dbSession) {
      await dbSession.abortTransaction();
    }
    console.error('Bid placement error:', error);

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
      { error: error instanceof Error ? error.message : 'Bid placement failed' },
      { status: 500 }
    );
  } finally {
    if (dbSession) {
      dbSession.endSession();
    }
  }
}