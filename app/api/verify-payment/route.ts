import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import Product from '@/app/lib/models/productModel';
import PixelConfig from '@/app/lib/models/pixelModel';
import dbConnect from '@/app/lib/db';
import { Types } from 'mongoose';

const stripe = new Stripe("sk_test_51R7u7XFWt2YrxyZwTMNvSl4gAgizA6e01XBp4sQGhLFId0qKAH1QdI2jFhlaFtHU9sMuPNHh8XvhB7DDQlfCnYiw00GsRA8POr", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { sessionId, productId } = await request.json();

    // 1. Verify Stripe payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    // 2. Find the product
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.status === 'active') return NextResponse.json({ success: true }); // Already processed

    // 3. Allocate pixels
    const config = await PixelConfig.findOne().sort({ createdAt: -1 });
    if (!config) throw new Error('Pixel config not found');

    const availablePixels = config.auctionZones.flatMap((zone: any) => zone.pixelIndices || []);
    const usedPixels = (await Product.find({ status: 'won' }))
      .flatMap(p => p.pixelIndices || []);

    const allocatablePixels = availablePixels.filter((p: number) => !usedPixels.includes(p));
    const allocatedPixels = allocatablePixels.slice(0, product.pixelCount);

    if (allocatedPixels.length < product.pixelCount) {
      throw new Error(`Not enough pixels available (${allocatedPixels.length}/${product.pixelCount})`);
    }

    // 4. Update database
    product.status = 'active';
    product.pixelIndices = allocatedPixels;
    product.pixelIndex = allocatedPixels[0];
    product.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await product.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
}