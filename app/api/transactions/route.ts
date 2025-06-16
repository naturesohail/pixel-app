import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Transaction from "@/app/lib/models/transactionModel";
import jwt from "jsonwebtoken";



export async function GET(request: Request) {
  try {
    await dbConnect();

    const token = request.headers.get("cookie")?.split("authToken=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    const transactions = await Transaction.find({ userId: decoded.id })
      .populate("productId", "title price pixelCount")
      .sort({ transactionDate: -1 });

    return NextResponse.json({ transactions });
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}