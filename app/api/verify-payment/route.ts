import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/app/lib/db";
import Product from "@/app/lib/models/productModel";
import PixelConfig from "@/app/lib/models/pixelModel";
import Transaction from "@/app/lib/models/transactionModel";
import mongoose, { Types } from "mongoose";
import Bid from "@/app/lib/models/bidModel";

const stripe = new Stripe(
  "sk_test_51R7u7XFWt2YrxyZwTMNvSl4gAgizA6e01XBp4sQGhLFId0qKAH1QdI2jFhlaFtHU9sMuPNHh8XvhB7DDQlfCnYiw00GsRA8POr",
  {
    apiVersion: "2025-02-24.acacia",
  }
);

type ProductMetadata = {
  userId: string;
  pixelCount?: string;
  title: string;
  url: string;
  images: string;
  totalPrice: string;
  isOneTimePurchase?: string;
  targetZoneId?: string;
  paymentType?: string;
  bidId?: string;
  zoneId?: string;
};

export async function POST(request: Request) {
  let dbSession;
  try {
    await dbConnect();
    const { sessionId } = await request.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const metadata = session.metadata as ProductMetadata;
    if (!metadata) throw new Error("Missing metadata");

    const userId = metadata.userId;
    const title = metadata.title;
    const url = metadata.url;
    const totalPrice = parseFloat(metadata.totalPrice);
    const rawImages: string[] = JSON.parse(metadata.images);
    const paymentType = metadata.paymentType || "one-time";
    const isBidPayment = paymentType === "winner-bid";

    // Handle zone ID for both payment types
    const targetZoneId = metadata.targetZoneId || metadata.zoneId;
    if (!targetZoneId) throw new Error("Missing zone ID");

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const config = await PixelConfig.findOne().sort({ createdAt: -1 }).session(dbSession);
    if (!config) throw new Error("Pixel config not found");

    let allocatedPixels: number[] = [];
    let actualPixelCount: number;
    let productData: any;
    let isOneTimePurchase = false;

    if (isBidPayment) {
      // ============= BID PAYMENT BLOCK =============
      if (!metadata.bidId) throw new Error("Missing bid ID for winner payment");
      
      // Validate and update bid
      const bid = await Bid.findById(metadata.bidId).session(dbSession);
      if (!bid) throw new Error("Bid not found");
      if (bid.userId.toString() !== userId) throw new Error("Unauthorized bid payment");
      if (bid.paid) throw new Error("Bid already paid");

      // Get auction zone
      const auctionZone = config.auctionZones.find(
        (z: any) => z._id.toString() === targetZoneId
      );
      if (!auctionZone) throw new Error("Auction zone not found");
      
      // Allocate all pixels from the auction zone
      allocatedPixels = auctionZone.pixelIndices;
      actualPixelCount = auctionZone.totalPixels;

      // Update bid status
      bid.paid = true;
      bid.status = "paid";
      await bid.save({ session: dbSession });

      // Create product data for bid win
      productData = {
        title: `${title} (Auction Win)`,
        price: totalPrice,
        images: rawImages,
        url,
        owner: new Types.ObjectId(userId),
        zoneId: new Types.ObjectId(targetZoneId),
        status: "active",
        purchaseType: "bid",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        pixelCount: auctionZone.totalPixels,
        // pixelIndices: allocatedPixels,
        // pixelIndex: allocatedPixels[0],
      };
    } else {
      // ============= ONE-TIME PURCHASE BLOCK (ORIGINAL LOGIC) =============
      isOneTimePurchase = metadata.isOneTimePurchase === "true";
      const pixelCount = parseInt(metadata.pixelCount || "0", 10);
      if (pixelCount <= 0) throw new Error("Invalid pixel count");
      
      // Original pixel allocation logic
      const availablePixels = config.auctionZones.flatMap((zone: any) => zone.pixelIndices || []);
      const usedPixels = (await Product.find({ status: "active" })).flatMap(p => p.pixelIndices || []);
      const allocatablePixels = availablePixels.filter((p:any) => !usedPixels.includes(p));
      allocatedPixels = allocatablePixels.slice(0, pixelCount);
      actualPixelCount = allocatedPixels.length;

      // Create product data for one-time purchase
      productData = {
        title,
        price: totalPrice,
        images: rawImages,
        url,
        owner: new Types.ObjectId(userId),
        zoneId: new Types.ObjectId(targetZoneId),
        status: "active",
        purchaseType: isOneTimePurchase ? "one-time" : "bid",
        expiryDate: isOneTimePurchase
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        pixelCount: actualPixelCount,
        pixelIndices: allocatedPixels,
        pixelIndex: allocatedPixels[0],
      };
    }

    const [product] = await Product.create([productData], { session: dbSession });

    await Transaction.create([{
      userId: new Types.ObjectId(userId),
      productId: product._id,
      amount: totalPrice,
      pixelCount: actualPixelCount,
      status: "completed",
      stripeSessionId: sessionId,
    }], { session: dbSession });

    // Pixel config update
    if (isBidPayment) {
      // For bids: Update the specific zone status
      await PixelConfig.updateOne(
        { _id: config._id },
        {
          $set: {
            "auctionZones.$[zone].status": "sold",
            "auctionZones.$[zone].isEmpty": false,
          },
          $inc: { availablePixels: -actualPixelCount },
        },
        {
          session: dbSession,
          arrayFilters: [{ "zone._id": new mongoose.Types.ObjectId(targetZoneId) }],
        }
      );
    } else {
      // For one-time: Use original update logic
      await PixelConfig.updateOne(
        {},
        {
          $set: {
            "auctionZones.$[zone].status": "sold",
            "auctionZones.$[zone].isEmpty": false,
          },
          $inc: { availablePixels: -actualPixelCount },
        },
        {
          session: dbSession,
          arrayFilters: [{ "zone._id": new mongoose.Types.ObjectId(targetZoneId) }],
        }
      );
    }

    await dbSession.commitTransaction();
    return NextResponse.json({ 
      success: true, 
      productId: product._id,
    });
  } catch (error) {
    if (dbSession) await dbSession.abortTransaction();
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    if (dbSession) dbSession.endSession();
  }
}