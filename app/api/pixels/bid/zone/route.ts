import { NextResponse } from "next/server";
import Bid from "@/app/lib/models/bidModel";
import dbConnect from "@/app/lib/db";
import { Types } from "mongoose";
import PixelConfig from "@/app/lib/models/pixelModel";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get("zoneId");

    if (!zoneId) {
      return NextResponse.json(
        { error: "zoneId is required" },
        { status: 400 }
      );
    }

    const [bids, config] = await Promise.all([
      Bid.find({ zoneId }).sort({ createdAt: -1 }),
      PixelConfig.findOne().sort({ createdAt: -1 }),
    ]);

    if (!config) {
      return NextResponse.json(
        { error: "Pixel config not found" },
        { status: 404 }
      );
    }

    const auctionWinMs = (config.auctionWinDays || 0) * 1 * 60 * 1000;
    console.log("auctionWinMs :>> ", auctionWinMs);
    // Determine the highest bidAmount for this zone
    const highestBidAmount = bids.length
      ? Math.max(...bids.map((b) => b.bidAmount))
      : 0;

    const enrichedBids = bids.map((bid) => {
      const createdAtTime = new Date(bid.createdAt).getTime();
      const resultTime = createdAtTime + auctionWinMs;
      const expired = Date.now() > resultTime;
      const isHighest = bid.bidAmount === highestBidAmount;

      return {
        ...bid.toObject(),
        winStatus: expired && isHighest,
        resultTime
      };
    });

    return NextResponse.json({ success: true, bids: enrichedBids });
  } catch (error) {
    console.error("Error fetching bids by zone:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch bids",
      },
      { status: 500 }
    );
  }
}
