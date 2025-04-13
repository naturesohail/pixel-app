import { NextResponse } from 'next/server';
import PixelConfig from '@/app/lib/models/pixelModel';
import Bid from '@/app/lib/models/bidModel';
import Product from '@/app/lib/models/productModel';
import dbConnect from '@/app/lib/db';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { userId, pixelCount, totalPrice, product, isOneTimePurchase } = await request.json();
    
    // Validate input
    if (!Types.ObjectId.isValid(userId) || !pixelCount || !product) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current config with proper null checking
    const config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      return NextResponse.json(
        { error: 'Pixel configuration not found' },
        { status: 404 }
      );
    }

    // Determine bidIndex based on existing products count
    const productsCount = await Product.countDocuments();
    const bidIndex = productsCount;

    // Check if this bidIndex already exists in bids
    const existingBidForIndex = await Bid.findOne({ bidIndex });
    
    // Only deduct pixels if this is the first bid for this index
    let shouldDeductPixels = !existingBidForIndex;
    let updatedConfig = config;

    if (shouldDeductPixels) {
      // Check available pixels
      if (config.availablePixels < pixelCount) {
        return NextResponse.json(
          { error: 'Not enough pixels available' },
          { status: 400 }
        );
      }

      // Update pixel config with proper null checking
      const updateResult = await PixelConfig.findByIdAndUpdate(
        config._id,
        { $inc: { availablePixels: -pixelCount } },
        { new: true }
      );

      if (!updateResult) {
        throw new Error('Failed to update pixel configuration');
      }
      updatedConfig = updateResult;
    }

    // Create bid with all required fields
    const newBid = await Bid.create({
      title: product.title,
      description: product.description,
      images: product.images || [],
      url: product.url || '',
      category: product.category || 'other',
      userId: new Types.ObjectId(userId),
      pixelCount: pixelCount,
      bidAmount: totalPrice,
      status: 'pending',
      bidIndex: bidIndex,
      isOneTimePurchase: isOneTimePurchase || false
    });

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      bid: newBid,
      message: shouldDeductPixels 
        ? 'Pixels deducted for new bid index' 
        : 'Bid created for existing index (no pixels deducted)'
    });

  } catch (error) {
    console.error('Bid placement error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to place bid' },
      { status: 500 }
    );
  }
}