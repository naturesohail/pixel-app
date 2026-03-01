import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Bid from "@/app/lib/models/bidModel";
import AuctionNotification from "@/app/lib/models/auctionNotification";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get("zoneId");

    if (!zoneId) {
      return NextResponse.json({ error: "Zone ID required" }, { status: 400 });
    }

    const bids = await Bid.find({ zoneId })
      .populate("userId")
      .sort({ bidAmount: -1, createdAt: 1 });

    const now = new Date();

    const activeWinner = await AuctionNotification.findOne({
      auctionZoneId: zoneId,
      notificationType: "winner",
      isWinnerActive: true,
      paymentCompleted: false,
      paymentDeadline: { $gt: now },
    }).populate("bidId");

    let activeWinnerBidId: string | null = null;
    let highestBidAmount = 0;

    if (activeWinner && activeWinner.bidId) {
      activeWinnerBidId = activeWinner.bidId._id.toString();
      highestBidAmount = activeWinner.bidId.bidAmount;
    }

    const enrichedBids = bids.map((bid: any) => ({
      ...bid.toObject(),
      isActiveWinner: bid._id.toString() === activeWinnerBidId,
    }));

    return NextResponse.json({
      bids: enrichedBids,
      highestBid: highestBidAmount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 });
  }
}