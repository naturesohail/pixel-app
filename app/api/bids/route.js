"use server";

import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Bid from "@/app/lib/models/bidModel";
import Product from "@/app/lib/models/productModel";


// GET all bids
export async function GET() {
  await connectDB();
  const bids = await Bid.find().sort({ createdAt: -1 }).populate("userId productId");
  return NextResponse.json(bids);
}

export async function POST(request) {
  await connectDB();

  try {
    const body = await request.json();
    const { userId, productId, totalPixels, bidAmount } = body;

    if (!userId || !productId || !totalPixels || !bidAmount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newBid = await Bid.create({
      userId,
      productId,
      totalPixels,
      bidAmount,
    });

   
    // Ensure pixel-related fields are numbers
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Ensure pixel-related fields are numbers
    product.totalPixel = Number(product.totalPixel) || 0;
    product.pixelBid = Number(product.pixelBid) || 0;
    
  
    product.totalPixel -= totalPixels;
    product.pixelBid += totalPixels;
    
    await product.save();
        

    return NextResponse.json(newBid, { status: 201 });
  } catch (error) {
    console.error("Error creating bid:", error);
    return NextResponse.json({ error: "Failed to create bid" }, { status: 500 });
  }
}

export async function PUT(request) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { totalPixels, bidAmount, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Bid ID is required" }, { status: 400 });
    }

    const updatedBid = await Bid.findByIdAndUpdate(
      id,
      { totalPixels, bidAmount, status },
      { new: true }
    );

    if (!updatedBid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error("Error updating bid:", error);
    return NextResponse.json({ error: "Failed to update bid" }, { status: 500 });
  }
}

// DELETE a bid
export async function DELETE(request) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
    }

    const deletedBid = await Bid.findByIdAndDelete(id);

    if (!deletedBid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Bid deleted successfully" });

  } catch (error) {
    console.error("Error deleting bid:", error);
    return NextResponse.json({ error: "Failed to delete bid" }, { status: 500 });
  }
}
