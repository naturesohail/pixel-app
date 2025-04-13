"use server";

import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Pixel from "@/app/lib/models/pixelModel";

export async function GET(request: Request, { params }: any) {
  await connectDB();

  try {
    const { id: pixelId } = params;

    const bids = await Pixel.findById(pixelId)

    return NextResponse.json(bids);
  } catch (err) {
    console.error("Failed to fetch product-specific bids:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
