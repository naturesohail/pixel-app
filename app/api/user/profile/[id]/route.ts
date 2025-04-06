"use server";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Bid from "@/app/lib/models/bidModel";

export async function GET(
  req: NextRequest,
  { params }: any 
) {
  try {
    await connectDB();

    const userId = params.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const bids = await Bid.find({ userId }).populate("userId").populate("productId");

    return NextResponse.json(bids, { status: 200 });

  } catch (error) {
    console.error("Fetch user bids error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
