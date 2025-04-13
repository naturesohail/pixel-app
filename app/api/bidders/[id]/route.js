import User from "@/app/lib/models/userModel";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";



export async function PATCH(request, { params }) {
  const { id } = params;
  await connectDB();
  
  try {
    const { isActive } = await request.json();
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  await connectDB();
  
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}