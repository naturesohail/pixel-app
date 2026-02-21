import User from "@/app/lib/models/userModel";
import Transaction from "@/app/lib/models/transactionModel";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // ✅ Step 1: Get all bidder userIds (who made payment)
    const bidderUserIds = await Transaction.distinct("userId", {
      status: "completed", // optional (recommended)
    });

    // ✅ Step 2: Create query for NON-bidders
    const searchQuery = {
      _id: { $nin: bidderUserIds }, // NOT IN
      isAdmin: false,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };

    // ✅ Step 3: Count
    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    // ✅ Step 4: Fetch paginated users
    const users = await User.find(searchQuery, {
      password: 0,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      users,
      totalPages,
      currentPage: page,
      totalUsers,
    });

  } catch (error) {
    console.error("Error fetching non-bidders:", error);
    return NextResponse.json(
      { error: "Failed to fetch non-bidders: " + error.message },
      { status: 500 }
    );
  }
}
