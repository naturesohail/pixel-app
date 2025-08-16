"use server";
import { NextResponse } from "next/server";
import User from "@/app/lib/models/userModel";
import connectDB from "@/app/lib/db";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import industryModel from "@/app/lib/models/industryModel";
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
      companyName 
    } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(industry)) {
      return NextResponse.json({ error: "Invalid industry ID" }, { status: 400 });
    }

    const industryExists = await industryModel.findById(industry);
    if (!industryExists) {
      return NextResponse.json({ error: "Industry not found" }, { status: 404 });
    }

    if (!companyName || !name || !email || !password || !phone || !industry || !website || !businessDescription) { 
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await User.create({
      name,
      email,
      phone,
      industry, // Store industry ID
      website,
      businessDescription,
      password: hashedPassword,
      companyName: companyName || "",
    });

    return NextResponse.json({ createUser }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
