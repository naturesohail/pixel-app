"use server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/app/lib/models/productModel";
import { MONGO_URI } from "@/app/lib/db";

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
