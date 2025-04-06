
import connectDB from "@/app/lib/db";
import ContactMessage from "@/app/lib/models/contactModel";
import { NextResponse } from "next/server";


export async function DELETE(params) {
    await connectDB();
  
    try {
      const contact = await ContactMessage.findByIdAndDelete(params.id);
  
      if (!contact) {
        return NextResponse.json(
          { error: "Query not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "Query deleted successfully", contact },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting contact:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }