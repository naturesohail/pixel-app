import { NextResponse } from "next/server";
import PixelConfig from "@/app/lib/models/pixelModel";
import Bid from "@/app/lib/models/bidModel";

import dbConnect from "@/app/lib/db";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Get all bids of this user
    const userBids = await Bid.find({ userId }).sort({
      createdAt: -1,
    });

    if (!userBids.length) {
      return NextResponse.json({
        success: true,
        auctionZones: [],
      });
    }

    // 2️⃣ Get unique zoneIds
    const zoneIds = [...new Set(userBids.map(b => b.zoneId.toString()))];

    // 3️⃣ Get latest PixelConfig
    const config = await PixelConfig.findOne().sort({ createdAt: -1 });

    if (!config) {
      return NextResponse.json({
        success: true,
        auctionZones: [],
      });
    }

    // 4️⃣ Filter zones that user has bid in
    const myZones = config.auctionZones
      .filter((zone: any) =>
        zoneIds.includes(zone._id.toString())
      )
      .map((zone: any) => {
        const zoneObj = zone.toObject();

        const bidsForThisZone = userBids.filter(
          (bid:any) => bid.zoneId.toString() === zone._id.toString()
        );

        return {
          ...zoneObj,
          bids: bidsForThisZone,
        };
      });

    return NextResponse.json({
      success: true,
      auctionZones: myZones,
    });

  } catch (error) {
    console.error("Error fetching my bids:", error);
    return NextResponse.json(
      { error: "Failed to fetch my bids" },
      { status: 500 }
    );
  }
}
