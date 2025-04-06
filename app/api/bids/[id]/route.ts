"use server";

import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Bid from "@/app/lib/models/bidModel";

export async function GET(request: Request, { params }: any) {
  await connectDB();

  try {
    const { id: productId } = params;

    const bids = await Bid.find({ productId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone") // Adjust based on your user schema
      .populate("productId");

    return NextResponse.json(bids);
  } catch (err) {
    console.error("Failed to fetch product-specific bids:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
