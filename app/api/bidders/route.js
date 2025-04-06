import User from "@/app/lib/models/userModel";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";

export async function GET() {
  try {
    await connectDB();
    const bidders = await User.find({ roles: 'users' }).sort({ createdAt: -1 });
    return NextResponse.json({ bidders });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch bidders" }, { status: 500 });
  }
}
