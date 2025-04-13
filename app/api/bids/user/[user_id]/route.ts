import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Bid from "@/app/lib/models/bidModel";

export async function GET(request: Request, { params }: { params: any }) {
  await connectDB();

  try {
    const { userId } = params;

    const bids = await Bid.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(bids);
  } catch (err) {
    console.error("Failed to fetch user bids:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}