"use server";
import { NextResponse } from "next/server";
import User from "@/app/lib/models/userModel";
import connectDB from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { 
      name, 
      email, 
      phone, 
      password, 
      industry, 
      website,
      businessDescription,
      companyName // New optional field
    } = await req.json();

    // Validate required fields (companyName is optional)
    if (!name || !email || !password || !phone || !industry || !website || !businessDescription) { 
      return NextResponse.json(
        { error: "All fields except company name are required" },
        { status: 400 }
      );
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: "Email Already Exists" }, { status: 401 });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json({ error: "Phone number Already Exists" }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await User.create({
      name,
      email,
      phone,
      industry,
      website,
      businessDescription,
      password: hashedPassword,
      companyName: companyName || "", // Handle optional field
    });

    return NextResponse.json({ createUser }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}