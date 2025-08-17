import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import PixelConfig from "@/app/lib/models/pixelModel";
import { getSession } from "@/app/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: { zoneId: string } }) {
  try {
    await dbConnect();
    const session = await getSession();
    

    const zoneId = params.zoneId;
    
    // Find and update the pixel config
    const config = await PixelConfig.findOne();
    if (!config) {
      return NextResponse.json(
        { error: "Pixel config not found" },
        { status: 404 }
      );
    }

    // Filter out the zone to be deleted
    const originalZoneCount = config.auctionZones.length;
    config.auctionZones = config.auctionZones.filter(
      (zone: any) => zone._id.toString() !== zoneId
    );

    // Check if zone was actually removed
    if (config.auctionZones.length === originalZoneCount) {
      return NextResponse.json(
        { error: "Auction zone not found" },
        { status: 404 }
      );
    }

    await config.save();

    return NextResponse.json({
      success: true,
      message: "Auction zone deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}