"use server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import User from "@/app/lib/models/userModel";
import connectDB from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "2d" }
    );

    // ✅ Fix: Set the cookie correctly
    const cookie = serialize("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60, // 2 days
      path: "/",
    });

    return new Response(
      JSON.stringify({ message: "Login successful" }),
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
