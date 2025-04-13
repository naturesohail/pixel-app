"use strict";
import { NextResponse } from 'next/server';
import Product from '@/app/lib/models/productModel';
import Pixel from '@/app/lib/models/pixelModel';
import User from '@/app/lib/models/userModel';
import dbConnect from '@/app/lib/db';
import mongoose from 'mongoose';

export async function POST(request) {
  await dbConnect();
  
  try {
    const { userId, pixelIndex, product } = await request.json();
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId) || typeof pixelIndex !== 'number' || !product) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Convert userId to ObjectId for query
    const userIdObj = new mongoose.Types.ObjectId(userId);

    // Check if user owns the pixel
    const pixel = await Pixel.findOne({ 
      index: pixelIndex, 
      owner: userIdObj 
    });

    if (!pixel) {
      return NextResponse.json(
        { error: 'Pixel not owned by user' },
        { status: 403 }
      );
    }

    // Check if pixel already has a product
    if (pixel.product) {
      return NextResponse.json(
        { error: 'Pixel already has a listed product' },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct = await Product.create({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
      owner: userIdObj,
      pixelIndex
    });

    // Update pixel with product reference - FIXED
    pixel.product = new mongoose.Types.ObjectId(newProduct._id.toString());
    await pixel.save();

    // Get updated grid
    const totalPixels = await Pixel.countDocuments();
    const pixels = await Pixel.find()
      .populate('owner', 'email _id')
      .populate('product');

    const pixelData = pixels.map((pixel) => ({
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
    console.error('Listing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to list product';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}