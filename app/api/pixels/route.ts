// route.ts
import { NextResponse } from 'next/server';
import PixelConfig from '@/app/lib/models/pixelModel';
import Product from '@/app/lib/models/productModel';
import dbConnect from '@/app/lib/db';

let isConnected = false;

export async function GET() {
  await dbConnect();
  
  try {
    const config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }

    const products = await Product.find({
      status: 'won',
      expiryDate: { $gt: new Date() }
    });

    return NextResponse.json({ 
      success: true, 
      config,
      products 
    });

  } catch (error) {
    console.error('Error fetching pixel data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pixel data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    
    if (!isConnected) {
      await dbConnect();
      isConnected = true;
    }

    const { pricePerPixel, oneTimePrice, totalPixels, minimumOrderQuantity, auctionWinDays } = await request.json();

    const availablePixels = totalPixels;

    const newConfig = await PixelConfig.create({
      pricePerPixel,
      oneTimePrice,
      totalPixels,
      availablePixels,
      minimumOrderQuantity: minimumOrderQuantity || 1,
      auctionWinDays: auctionWinDays || 2
    });

    return NextResponse.json({ success: true, config: newConfig });

  } catch (error) {
    console.error('Error creating pixel config:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!isConnected) {
      await dbConnect();
      isConnected = true;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { pricePerPixel, oneTimePrice, totalPixels, minimumOrderQuantity, auctionWinDays } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    const updatedConfig = await PixelConfig.findByIdAndUpdate(
      id,
      { 
        pricePerPixel, 
        oneTimePrice, 
        totalPixels,
        minimumOrderQuantity,
        auctionWinDays
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedConfig) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, config: updatedConfig });

  } catch (error) {
    console.error('Error updating pixel config:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isConnected) {
      await dbConnect();
      isConnected = true;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    const deletedConfig = await PixelConfig.findByIdAndDelete(id).lean();

    if (!deletedConfig) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting pixel config:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}