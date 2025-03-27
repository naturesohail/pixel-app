"use server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/app/lib/models/productModel";
import { MONGO_URI } from "@/app/lib/db";
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

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
}
export async function GET() {
  await connectDB();
  
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'categories', // Ensure this matches your MongoDB collection name
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' }, // Flatten category array (if always present)
      {
        $project: {
          _id: 1,
          productName: 1,
          price: 1,
          productStatus: 1,
          auctionType: 1,
          biddingEndTime: 1,
          totalPixel: 1,
          image: 1,
          categoryId: 1,
          categoryName: '$category.category', 
        },
      },
    ]);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}



// ✅ Create a new pixel product
export async function POST(request) {
  await connectDB();

  try {
    const formData = await request.formData();
    const productName = formData.get("productName");
    const totalPixel = formData.get("totalPixel");
    const biddingEndTime = formData.get("biddingEndTime");

    const price = parseFloat(formData.get("price"));
    const productStatus = formData.get("productStatus");
    const categoryId = formData.get("categoryId");
    const auctionType = formData.get("auctionType");

    let imageUrl = existingProduct.image;
    const image = formData.get("image");
    if (image) {
      imageUrl = await uploadToCloudinary(image, "products");
    }

    const newProduct = await Product.create({
      productName,
      price,
      productStatus,
      categoryId,
      auctionType,
      currentBid: auctionType === "auction" ? 0 : null,
      image: imageUrl,
      totalPixel,
      biddingEndTime
    });

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
    const totalPixel = formData.get("totalPixel");
    const biddingEndTime = formData.get("biddingEndTime");
    const price = parseFloat(formData.get("price"));
    const productStatus = formData.get("productStatus");
    const categoryId = formData.get("categoryId");
    const auctionType = formData.get("auctionType");

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let imageUrl = existingProduct.image;
    const image = await formData.get("image"); // Awaiting formData properly

    // Update image only if a new one is provided
    if (image && typeof image === "object" && image.size > 0) {
      imageUrl = await uploadToCloudinary(image, "products");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName,
        price,
        productStatus,
        categoryId,
        auctionType,
        image: imageUrl, // Keeps old image if no new image is uploaded
        totalPixel,
        biddingEndTime,
      },
      { new: true }
    );

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating Product:", error);
    return NextResponse.json({ error: "Failed to update Product" }, { status: 500 });
  }
}

// ✅ Delete a pixel product
export async function DELETE(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid Product ID" }, { status: 400 });
  }

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted successfully" });
}
