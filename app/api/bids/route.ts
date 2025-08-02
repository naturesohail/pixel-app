
import { NextResponse } from "next/server";
import Bid from "@/app/lib/models/bidModel";
import dbConnect from "@/app/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const authToken = (await cookieStore).get("authToken")?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(authToken, process.env.JWT_SECRET!);
    await dbConnect();

    const body = await request.json();
    const { zoneId, bidAmount, pixelCount } = body;

    if (!zoneId || bidAmount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the highest bid index
    const highestBid = await Bid.findOne({ zoneId }).sort({ bidIndex: -1 });
    const nextBidIndex = highestBid ? highestBid.bidIndex + 1 : 1;

    const newBid = new Bid({
      title: "",
      description: "",
      images: [],
      url: "",
      category: "other",
      userId: decoded.id,
      zoneId,
      pixelCount,
      bidAmount,
      bidIndex: nextBidIndex,
      isOneTimePurchase: false,
      status: "pending"
    });

    await newBid.save();

    return NextResponse.json({
      success: true,
      bid: newBid,
      bidIndex: nextBidIndex
    });

  } catch (error) {
    console.error("Error placing bid:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to place bid",
      },
      { status: 500 }
    );
  }
}


