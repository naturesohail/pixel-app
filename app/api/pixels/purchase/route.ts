import { NextResponse } from 'next/server';
import Pixel from '@/app/lib/models/pixelModel';
import User from '@/app/lib/models/userModel';
import dbConnect from '@/app/lib/db';

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const { userId, pixelIndex, quantity, totalPrice } = await request.json();
    
    // Validate input
    if (!userId || pixelIndex === undefined || !quantity || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if pixels are available
    const pixelsToPurchase = await Pixel.find({
      index: { $gte: pixelIndex, $lt: pixelIndex + quantity },
      owner: null
    });

    if (pixelsToPurchase.length !== quantity) {
      return NextResponse.json(
        { error: 'Some pixels are already owned' },
        { status: 400 }
      );
    }

    
    // Update pixels
    await Pixel.updateMany(
      { index: { $gte: pixelIndex, $lt: pixelIndex + quantity } },
      { owner: userId }
    );

    // Get updated grid
    const totalPixels = await Pixel.countDocuments();
    const pixels = await Pixel.find().populate('owner', 'email _id').populate('product');

    const pixelData = pixels.map((pixel:any) => ({
      ownerId: pixel.owner?._id.toString() || null,
      listedProduct: pixel.product ? {
        id: pixel.product._id.toString(),
        title: pixel.product.title,
        description: pixel.product.description,
        price: pixel.product.price,
        category: pixel.product.category,
        images: pixel.product.images
      } : null
    }));

    return NextResponse.json({
      totalPixels,
      pixels: pixelData,
      pricePerPixel: 1
    });

  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Purchase failed' },
      { status: 500 }
    );
  }
}