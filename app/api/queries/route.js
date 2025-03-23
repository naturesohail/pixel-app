"use server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Specification from "@/app/lib/models/specificationModel";
import path from "path";
import { writeFile } from "fs/promises";
import { MONGO_URI } from "@/app/lib/db";

const uploadDir = path.join(process.cwd(), "public/uploads/specifications");

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
}

export async function GET() {
  await connectDB();
  const specifications = await Specification.find().lean();
  return NextResponse.json(specifications);
}


export async function POST(request) {
  await connectDB();
  try {
    const formData = await request.formData();
    const file = formData.get("specificationLogo");
    const specificationName = formData.get("specificationName");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${uploadDir}/${fileName}`;
    const publicPath = `/uploads/specifications/${fileName}`;  

    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    const specification = await Specification.create({ specificationName, logo: publicPath });
    return NextResponse.json(specification, { status: 201 });     
  } catch (error) { 
    console.error("Error adding specification:", error);
    return NextResponse.json({ error: "Failed to add specification" }, { status: 500 });
  }
}

export async function DELETE(request) {
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); 

  if (!id) {
    return NextResponse.json({ error: "Missing ID parameter" }, 
      { status: 400 });
  }

  const specification = await Specification.findByIdAndDelete(id);
  
  if (!specification) {
    return NextResponse.json({ error: "Specification not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted successfully" });
}

export async function PUT(request, { params }) {
  await connectDB();
  try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      const formData = await request.formData();
      const specificationName = formData.get("specificationName");
      const file = formData.get("specificationLogo");

      if (!id) {
          return NextResponse.json({ error: "ID is required" }, { status: 400 });
      }

        let updateData = { specificationName };

      if (file && file.name) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = path.join(uploadDir, fileName);
          const publicPath = `/uploads/specifications/${fileName}`;

          const buffer = await file.arrayBuffer();
          await writeFile(filePath, Buffer.from(buffer));

          updateData.logo = publicPath; 
      }

      const specification = await Specification.findByIdAndUpdate(id, updateData, { new: true });

      if (!specification) {
          return NextResponse.json({ error: "Specification not found" }, { status: 404 });
      }

      return NextResponse.json(specification);
  } catch (error) {
      console.error("Error updating specification:", error);
      return NextResponse.json({ error: "Failed to update specification" }, { status: 500 });
  }
}

