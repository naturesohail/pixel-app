import { NextResponse } from "next/server";
import PixelConfig from "@/app/lib/models/pixelModel";
import Bid from "@/app/lib/models/bidModel";
import Product from "@/app/lib/models/productModel";
import dbConnect from "@/app/lib/db";
import { Types } from "mongoose";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const {
      userId,
      pixelCount,
      bidAmount,
      product,
      isOneTimePurchase,
      zoneId,
    } = await request.json();

    if (!Types.ObjectId.isValid(userId) || !pixelCount || !product) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return NextResponse.json(
        { error: "Pixel configuration not found" },
        { status: 404 }
      );
    }

  

    const newBid = await Bid.create({
      title: product.title,
      description: product.description,
      images: product.images || [],
      url: product.url || "",
      category: product.category || "other",
      userId: new Types.ObjectId(userId),
      pixelCount: pixelCount,
      bidAmount: bidAmount,
      status: "pending",
      bidIndex: 1,
      zoneId: new Types.ObjectId(zoneId),
      isOneTimePurchase: isOneTimePurchase || false,
    });
    
    await PixelConfig.updateOne(
      {},
      {
        $push: {
          "auctionZones.$[zone].bids": newBid._id,
        },
        $set:{
          status:""
        }
      },
      {
        arrayFilters: [{ "zone._id": new mongoose.Types.ObjectId(zoneId) }],
      }
    );
    return NextResponse.json({
      success: true,
      config,
      bid: newBid,
      message: "bid created Successfully",
    });
  } catch (error) {
    console.error("Bid placement error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to place bid" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    const bids = await Bid.find({ userId: new Types.ObjectId(userId) }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, bids });
  } catch (error) {
    console.error("Error fetching user bids:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch bids",
      },
      { status: 500 }
    );
  }
}
