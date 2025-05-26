import { NextResponse } from "next/server";
import Stripe from "stripe";
import PixelConfig from "@/app/lib/models/pixelModel";
import Product from "@/app/lib/models/productModel";
import dbConnect from "@/app/lib/db";
import { Types } from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
cloudinary.config({
  cloud_name: "dtc1nqk9g",
  api_key: "988391113487354",
  api_secret: "o8IkkQeCn8vFEmG2gI6saI1R6mo",
});

const stripe = new Stripe(
  "sk_test_51R7u7XFWt2YrxyZwTMNvSl4gAgizA6e01XBp4sQGhLFId0qKAH1QdI2jFhlaFtHU9sMuPNHh8XvhB7DDQlfCnYiw00GsRA8POr",
  {
    apiVersion: "2025-02-24.acacia",
  }
);

export async function POST(request: Request) {
  let dbSession;
  try {
    await dbConnect();
    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const {
      userId,
      pixelCount,
      totalPrice,
      productData,
      isOneTimePurchase,
      targetZoneId,
    } = await request.json();

    // Validate input
    // if (!Types.ObjectId.isValid(userId) || pixelCount <= 0 || !productData?.title) {
    //   throw new Error('Invalid request data');
    // }

    // Get latest pixel config with auction zones
    const [config] = await PixelConfig.find()
      .sort({ createdAt: -1 })
      .session(dbSession);

    console.log("Pixel config:", config);
    // if (!config) throw new Error('Pixel configuration not found');

    // Process and upload images to Cloudinary
    const processedImages: string[] = [];
    for (const image of productData.images) {
      if (image.startsWith("data:image")) {
        const result = await cloudinary.uploader.upload(image, {
          folder: `pixel-products/${userId}`,
        });
        processedImages.push(result.secure_url);
      } else if (image.startsWith("http")) {
        processedImages.push(image);
      }
    }

    if (processedImages.length === 0) {
      throw new Error("At least one product image is required");
    }

    // Create the product with zone reference
    const [product] = await Product.create(
      [
        {
          title: productData.title,
          price: totalPrice,
          images: processedImages,
          url: productData.url || "",
          owner: new Types.ObjectId(userId),
          // pixelCount,
          // pixelIndices: allocatedPixels,
          // pixelIndex: allocatedPixels[0],
          zoneId: new Types.ObjectId(targetZoneId), // Ensure proper ObjectId
          status: "active", // Mark as active immediately for one-time purchases
          purchaseType: isOneTimePurchase ? "one-time" : "bid",
          expiryDate: isOneTimePurchase
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year for one-time
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for bids
        },
      ],
      { session: dbSession }
    );


    // Update available pixels count
    config.availablePixels = Math.max(0, config.availablePixels - pixelCount);
    await config.save({ session: dbSession });



    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${productData.title} (${pixelCount} pixels)`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],

      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}&product_id=${product._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        userId,
        productId: product._id.toString(),
        pixelCount: pixelCount.toString(),
        zoneId: targetZoneId,
      },
    });

    // update auction zone as booked
    await PixelConfig.updateOne(
      {},
      {
        $set: {
          "auctionZones.$[zone].status": "sold",
          "auctionZones.$[zone].isEmpty": false,

        },
      },
      {
        session: dbSession,
        arrayFilters: [
          { "zone._id": new mongoose.Types.ObjectId(targetZoneId) },
        ],
      }
    );
 
    // In your POST handler, after creating the Stripe session:
    await dbSession.commitTransaction();
    return NextResponse.json({
      id: session.id,
      url: session.url, // Add this line to return the checkout URL
      productId: product._id,
      zoneId: targetZoneId,
    });
  } catch (error) {
    console.error("whole error:", error);

    if (dbSession) await dbSession.abortTransaction();
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Payment processing failed",
      },
      { status: 500 }
    );
  } finally {
    if (dbSession) dbSession.endSession();
  }
}
