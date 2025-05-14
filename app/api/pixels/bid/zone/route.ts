import { NextResponse } from "next/server";
import Bid from "@/app/lib/models/bidModel";
import dbConnect from "@/app/lib/db";
import jwt from "jsonwebtoken";
import PixelConfig from "@/app/lib/models/pixelModel";
import { cookies } from "next/headers";

export async function GET(request: Request) {

  try {
    const cookieStore = cookies();
    const authToken = (await cookieStore).get("authToken")?.value;
    if (!authToken) return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    );
    const decoded: any = jwt.verify(authToken, process.env.JWT_SECRET!);
    console.log("decoded:", decoded);
    await dbConnect();
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

    const auctionWinMs = (config.auctionWinDays || 0) * 24 * 60 * 60 * 1000;;
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
    // filter the highgest bid
    function getHighestAndUserBid(bids: any[], userId: string) {
      if (!Array.isArray(bids) || bids.length === 0) return { bids: [] };

      const highest = bids.reduce((maxBid, currentBid) =>
        currentBid.bidAmount > maxBid.bidAmount ? currentBid : maxBid
      );

      const userBid = bids.find(bid => bid.userId.toString() === userId);

      if (!userBid) return { bids: [highest] };

      if (highest._id.toString() === userBid._id.toString()) {
        // Same bid object
        return [highest]
      }

      return [highest, userBid]
    }
    return NextResponse.json({ success: true, bids: getHighestAndUserBid(enrichedBids, decoded.id) });
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
