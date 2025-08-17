import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import User from "@/app/lib/models/userModel";
import { getSession } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { adminEmail, userId } = await req.json();
    
    if (!adminEmail || !userId) {
      return NextResponse.json(
        { error: "Email and user ID are required" },
        { status: 400 }
      );
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }
    
    // Update email
    user.email = adminEmail;
    user.businessDescription = "N/A";
    user.website = "N/A";
    user.industry = null;

    await user.save();
    
    return NextResponse.json({
      success: true,
      message: "Email updated successfully",
      email: adminEmail

    });
    
  } catch (error: any) {
    console.error("Email update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}