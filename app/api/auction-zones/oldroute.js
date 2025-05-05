import { NextResponse } from 'next/server';
import PixelConfig from '@/app/lib/models/pixelModel';
import Product from '@/app/lib/models/productModel';
import dbConnect from '@/app/lib/db';

export async function GET() {
  await dbConnect();
  
  try {
    
    
    const config = await PixelConfig.findOne().sort({ createdAt: -1 })
      .populate('auctionZones.productIds');
    
    if (!config) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      auctionZones: config.auctionZones || [] 
    });

  } catch (error) {
    console.error('Error fetching auction zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction zones' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await dbConnect();
  
  try {
    const { 
      x, 
      y, 
      width, 
      height, 
      productIds = [], 
      isEmpty, 
      pixelIndices = [],
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

    const calculatedPixelIndices = pixelIndices.length > 0 ? pixelIndices : 
      Array.from({ length: width * height }, (_, i) => (y + Math.floor(i / width)) * 1000 + (x + (i % width)));

    const isOverlapping = config.auctionZones.some(zone => 
      x < zone.x + zone.width &&
      x + width > zone.x &&
      y < zone.y + zone.height &&
      y + height > zone.y
    );

    if (isOverlapping) {
      return NextResponse.json(
        { error: 'This zone overlaps with an existing auction zone' },
        { status: 400 }
      );
    }

    if (!isEmpty && productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } });
      if (products.length !== productIds.length) {
        return NextResponse.json(
          { error: 'One or more products not found' },
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
      pixelIndices: calculatedPixelIndices,
      minimumOrderQuantity: calculatedPixelIndices.length,
      auctionWinDays: 2,
    };

    config.auctionZones.push(newZone);
    
    // Update main config's minimumOrderQuantity based on the largest zone
    const largestZone = config.auctionZones.reduce((prev, current) => 
      (prev.pixelIndices.length > current.pixelIndices.length) ? prev : current
    );
    config.minimumOrderQuantity = largestZone.pixelIndices.length;
    
    await config.save();

    return NextResponse.json({ 
      success: true, 
      zone: config.auctionZones[config.auctionZones.length - 1],
      updatedMinimumOrderQuantity: config.minimumOrderQuantity
    });

  } catch (error) {
    console.error('Error creating auction zone:', error);
    return NextResponse.json(
      { error: 'Failed to create auction zone' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('id');
    const updates = await request.json();

    if (!zoneId) {
      return NextResponse.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    const config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }

    const zoneIndex = config.auctionZones.findIndex(z => z._id.toString() === zoneId);
    if (zoneIndex === -1) {
      return NextResponse.json(
        { error: 'Auction zone not found' },
        { status: 404 }
      );
    }

    if (updates.productIds) {
      const products = await Product.find({ _id: { $in: updates.productIds } });
      if (products.length !== updates.productIds.length) {
        return NextResponse.json(
          { error: 'One or more products not found' },
          { status: 400 }
        );
      }
    }

    // Store old pixelIndices length for comparison
    const oldPixelCount = config.auctionZones[zoneIndex].pixelIndices.length;
    
    config.auctionZones[zoneIndex] = {
      ...config.auctionZones[zoneIndex].toObject(),
      ...updates
    };

    // If pixelIndices were updated, check if we need to update the main minimumOrderQuantity
    if (updates.pixelIndices && updates.pixelIndices.length !== oldPixelCount) {
      const largestZone = config.auctionZones.reduce((prev, current) => 
        (prev.pixelIndices.length > current.pixelIndices.length) ? prev : current
      );
      config.minimumOrderQuantity = largestZone.pixelIndices.length;
    }

    await config.save();

    return NextResponse.json({ 
      success: true, 
      zone: config.auctionZones[zoneIndex],
      updatedMinimumOrderQuantity: config.minimumOrderQuantity
    });

  } catch (error) {
    console.error('Error updating auction zone:', error);
    return NextResponse.json(
      { error: 'Failed to update auction zone' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('id');

    if (!zoneId) {
      return NextResponse.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    const config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }

    const zoneIndex = config.auctionZones.findIndex(z => z._id.toString() === zoneId);
    if (zoneIndex === -1) {
      return NextResponse.json(
        { error: 'Auction zone not found' },
        { status: 404 }
      );
    }

    // Store the pixelIndices length before deletion
    const deletedZonePixelCount = config.auctionZones[zoneIndex].pixelIndices.length;
    
    config.auctionZones.splice(zoneIndex, 1);
    
    // Update minimumOrderQuantity if the deleted zone was the largest
    if (config.auctionZones.length > 0) {
      const largestZone = config.auctionZones.reduce((prev, current) => 
        (prev.pixelIndices.length > current.pixelIndices.length) ? prev : current
      );
      config.minimumOrderQuantity = largestZone.pixelIndices.length;
    } else {
      // If no zones left, reset to default
      config.minimumOrderQuantity = 1;
    }
    
    await config.save();

    return NextResponse.json({ 
      success: true,
      message: 'Auction zone deleted successfully',
      updatedMinimumOrderQuantity: config.minimumOrderQuantity
    });

  } catch (error) {
    console.error('Error deleting auction zone:', error);
    return NextResponse.json(
      { error: 'Failed to delete auction zone' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  await dbConnect();
  
  try {
    const { action, zones } = await request.json();

    if (!action || !zones || !Array.isArray(zones)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }

    if (action === 'saveAll') {
      config.auctionZones = zones.map(zone => ({
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        productIds: zone.productIds || [],
        isEmpty: zone.isEmpty || zone.productIds?.length === 0,
        pixelIndices: zone.pixelIndices || [],
        basePrice: zone.basePrice,
        currentBid: zone.currentBid,
        expiryDate: zone.expiryDate
      }));

      // Update minimumOrderQuantity based on the largest zone
      if (config.auctionZones.length > 0) {
        const largestZone = config.auctionZones.reduce((prev, current) => 
          (prev.pixelIndices.length > current.pixelIndices.length) ? prev : current
        );
        config.minimumOrderQuantity = largestZone.pixelIndices.length;
      } else {
        config.minimumOrderQuantity = 1;
      }

      await config.save();

      return NextResponse.json({ 
        success: true,
        zones: config.auctionZones,
        updatedMinimumOrderQuantity: config.minimumOrderQuantity
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}