"use server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/app/lib/models/userModel";
import connectDB from "@/app/lib/db";

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.split("authToken=")[1]?.split(";")[0];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
