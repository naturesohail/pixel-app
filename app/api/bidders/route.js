import User from "@/app/lib/models/userModel";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import industryModel from "@/app/lib/models/industryModel";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;
    
    const searchQuery = {
      isAdmin: false,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } }, 
      ],
    };

    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(searchQuery, { password: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);


      for (let user of users) {
        if (mongoose.Types.ObjectId.isValid(user.industry)) {
          const industry = await industryModel.findById(user.industry).select('industry');
          user.industry = industry ? industry.industry : "Unknown";
        } else {
          user.industry = "Unknown";
        }
      }
    


    return NextResponse.json({
      users,
      totalPages,
      currentPage: page,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users: " + error.message },
      { status: 500 }
    );
  }
}
