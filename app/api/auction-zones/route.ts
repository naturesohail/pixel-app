import { NextResponse } from "next/server";
import PixelConfig from "@/app/lib/models/pixelModel";
import Product from "@/app/lib/models/productModel";
import dbConnect from "@/app/lib/db";

export async function GET() {
  await dbConnect();

  try {
    const config = await PixelConfig.findOne()
      .sort({ createdAt: -1 })
      .populate("auctionZones.productIds")
      .populate("auctionZones.currentBidder");

    if (!config) {
      return NextResponse.json(
        { error: "Pixel configuration not found" },
        { status: 404 }
      );
    }

    // Filter out expired zones (more than 1 hour past expiry)
    const now = new Date();
    const validZones = config.auctionZones.filter((zone: any) => {
      if (zone.expiryDate) {
        const expiryTime = new Date(zone.expiryDate).getTime();
        return now.getTime() - expiryTime < 3600000; // 1 hour grace period
      }
      return true;
    });

    // If any zones were filtered out, update the config
    if (validZones.length !== config.auctionZones.length) {
      config.auctionZones = validZones;
      await config.save();
    }

    return NextResponse.json({
      success: true,
      auctionZones: validZones,
    });
  } catch (error) {
    console.error("Error fetching auction zones:", error);
    return NextResponse.json(
      { error: "Failed to fetch auction zones" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  await dbConnect();

  try {
    const {
      x,
      y,
      width,
      height,
      productIds = [],
      isEmpty,
      auctionDuration = 3,
      buyNowPrice,
      pixelPrice = 0.01,
    } = await request.json();

    let config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      config = await PixelConfig.create({
        pricePerPixel: 0.01,
        oneTimePrice: 0.01,
        totalPixels: 1000000,
        availablePixels: 1000000,
        minimumOrderQuantity: 1,
        auctionWinDays: 2,
      });
    }

    // Calculate total pixels
    const totalPixels = width * height;

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + auctionDuration);

    // Check for overlapping zones
    const isOverlapping = config.auctionZones.some(
      (zone: any) =>
        x < zone.x + zone.width &&
        x + width > zone.x &&
        y < zone.y + zone.height &&
        y + height > zone.y
    );

    if (isOverlapping) {
      return NextResponse.json(
        { error: "This zone overlaps with an existing auction zone" },
        { status: 400 }
      );
    }

    // Validate products if zone is not empty
    if (!isEmpty && productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } });
      if (products.length !== productIds.length) {
        return NextResponse.json(
          { error: "One or more products not found" },
          { status: 400 }
        );
      }
    }

    const newZone = {
      x,
      y,
      width,
      height,
      productIds,
      isEmpty: isEmpty || productIds.length === 0,
      expiryDate,
      status: "active",
      buyNowPrice:
        buyNowPrice ||
        totalPixels * pixelPrice +
          (productIds.length > 0
            ? (await Product.find({ _id: { $in: productIds } })).reduce(
                (sum, p) => sum + (p.price || 0),
                0
              )
            : 0),
      totalPixels,
      pixelPrice,
    };
    config.auctionZones.push(newZone);
    await config.save();

    return NextResponse.json({
      success: true,
      zone: config.auctionZones[config.auctionZones.length - 1],
    });
  } catch (error) {
    console.error("Error creating auction zone:", error);
    return NextResponse.json(
      { error: "Failed to create auction zone" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get("id");
    const updates = await request.json();

    if (!zoneId) {
      return NextResponse.json(
        { error: "Zone ID is required" },
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

    const zoneIndex = config.auctionZones.findIndex(
      (z: any) => z._id.toString() === zoneId
    );
    if (zoneIndex === -1) {
      return NextResponse.json(
        { error: "Auction zone not found" },
        { status: 404 }
      );
    }

    if (updates.productIds) {
      const products = await Product.find({ _id: { $in: updates.productIds } });
      if (products.length !== updates.productIds.length) {
        return NextResponse.json(
          { error: "One or more products not found" },
          { status: 400 }
        );
      }
    }

    // Update the zone
    config.auctionZones[zoneIndex] = {
      ...config.auctionZones[zoneIndex].toObject(),
      ...updates,
    };

    await config.save();

    return NextResponse.json({
      success: true,
      zone: config.auctionZones[zoneIndex],
    });
  } catch (error) {
    console.error("Error updating auction zone:", error);
    return NextResponse.json(
      { error: "Failed to update auction zone" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get("id");

    if (!zoneId) {
      return NextResponse.json(
        { error: "Zone ID is required" },
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

    const zoneIndex = config.auctionZones.findIndex(
      (z: any) => z._id.toString() === zoneId
    );
    if (zoneIndex === -1) {
      return NextResponse.json(
        { error: "Auction zone not found" },
        { status: 404 }
      );
    }

    config.auctionZones.splice(zoneIndex, 1);
    await config.save();

    return NextResponse.json({
      success: true,
      message: "Auction zone deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting auction zone:", error);
    return NextResponse.json(
      { error: "Failed to delete auction zone" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  await dbConnect();

  try {
    const { action, zones } = await request.json();

    if (!action || !zones || !Array.isArray(zones)) {
      return NextResponse.json(
        { error: "Invalid request body" },
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

    if (action === "saveAll") {
      const allProductIds = zones.flatMap((zone) => zone.productIds || []);
      const products = await Product.find({ _id: { $in: allProductIds } });

      if (products.length !== new Set(allProductIds).size) {
        return NextResponse.json(
          { error: "One or more products not found" },
          { status: 400 }
        );
      }

      const existingZoneMap = new Map(
        config.auctionZones.map((zone: any) => [zone._id.toString(), zone])
      );

      const updatedZones: any[] = [];

      for (const newZone of zones) {
        const zoneId = newZone._id?.toString();

        if (zoneId && existingZoneMap.has(zoneId)) {
          // Update existing zone
          const existingZone: any = existingZoneMap.get(zoneId);
          if (!existingZone) return;
          Object.assign(existingZone, {
            x: newZone.x,
            y: newZone.y,
            width: newZone.width,
            height: newZone.height,
            productIds: newZone.productIds || [],
            isEmpty: newZone.isEmpty ?? newZone.productIds?.length === 0,
            basePrice: newZone.basePrice,
            currentBid: newZone.currentBid,
            expiryDate: newZone.expiryDate,
            status: newZone.status || existingZone.status,
            currentBidder: newZone.currentBidder,
            buyNowPrice: newZone.buyNowPrice,
            totalPixels: newZone.width * newZone.height,
            pixelPrice: newZone.pixelPrice || 0.01,
          });

          updatedZones.push(existingZone);
        } else {
          // New zone, insert
          updatedZones.push({
            x: newZone.x,
            y: newZone.y,
            width: newZone.width,
            height: newZone.height,
            productIds: newZone.productIds || [],
            isEmpty: newZone.isEmpty ?? newZone.productIds?.length === 0,
            basePrice: newZone.basePrice,
            currentBid: newZone.currentBid,
            expiryDate: newZone.expiryDate,
            status: newZone.status || "active",
            currentBidder: newZone.currentBidder,
            buyNowPrice: newZone.buyNowPrice,
            totalPixels: newZone.width * newZone.height,
            pixelPrice: newZone.pixelPrice || 0.01,
          });
        }
      }

      // Replace with updated zones
      config.auctionZones = updatedZones;
      await config.save();

      return NextResponse.json({
        success: true,
        zones: config.auctionZones,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
