"use server";
import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import Category from "@/app/lib/models/categoryModel";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: "dtc1nqk9g",
  api_key: "988391113487354",
  api_secret: "o8IkkQeCn8vFEmG2gI6saI1R6mo",
});

const uploadToCloudinary = async (file, folder) => {
  if (!file) return "";

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};


export async function GET() {
  await connectDB();
  const categories = await Category.find().sort({ createdAt: -1 });;
  return NextResponse.json(categories);
}

export async function POST(request) {
  await connectDB();
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const category = formData.get("category");


    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const imageUrl = await uploadToCloudinary(file, "categories");

    const data = await Category.create({ image: imageUrl, category:category });

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    // console.error("Error adding category:", error);
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}


export async function PUT(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const formData = await request.formData();
    const category = formData.get("category");
    const file = formData.get("image");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    let updateData = {
      category:category
    };

    if (file && file.name) {
      const imageUrl = await uploadToCloudinary(file, "categories");
      updateData.image = imageUrl;

    }

    const data = await Category.findByIdAndUpdate(id, updateData, { new: true });

    if (!data) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}


export async function DELETE(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted successfully" });
}