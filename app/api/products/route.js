"use server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/app/lib/models/productModel";
import path from "path";
import { writeFile } from "fs/promises";
import { MONGO_URI } from "@/app/lib/db";

const uploadDir = path.join(process.cwd(), "public/uploads/products");

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
}

export async function GET() {
  await connectDB();
  const products = await Product.find();
  return NextResponse.json(products);
}

export async function POST(request) {
  await connectDB();

  try {
    const formData = await request.formData();
    
    const productName = formData.get("productName");
    const categories = formData.get("categories");
    const image = formData.get("productImage");
    const description = formData.get("description");
    const price = formData.get("price");
    const productStatus = formData.get("productStatus");

    let publicPath = "";
    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      const filePath = `${uploadDir}/${fileName}`;
      publicPath = `/uploads/products/${fileName}`;
      await writeFile(filePath, Buffer.from(await image.arrayBuffer()));
    }

    const data = {
      productName,
      categories,
      image: publicPath,
      description,
      price,
      productStatus,
    };

    console.log("Saving Product Data:", data);

    const newProduct = await Product.create(data);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error adding Product:", error);
    return NextResponse.json({ error: "Failed to add Product" }, { status: 500 });
  }
}

export async function PUT(request) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Product ID" }, { status: 400 });
    }

    const formData = await request.formData();
    const productName = formData.get("productName");
    const categories = formData.get("categories");
    const image = formData.get("productImage");
    const description = formData.get("description");
    const price = formData.get("price");
    const productStatus = formData.get("productStatus");

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let publicPath = existingProduct.image;
    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      const filePath = `${uploadDir}/${fileName}`;
      publicPath = `/uploads/products/${fileName}`;
      await writeFile(filePath, Buffer.from(await image.arrayBuffer()));
    }

    const updateData = {
      productName,
      categories,
      image: publicPath,
      description,
      price,
      productStatus,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating Product:", error);
    return NextResponse.json({ error: "Failed to update Product" }, { status: 500 });
  }
}

export async function DELETE(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted successfully" });
}