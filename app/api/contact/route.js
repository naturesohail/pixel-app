import connectDB from "@/app/lib/db";
import ContactMessage from "@/app/lib/models/contactModel";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    await connectDB();
    const contacts = await ContactMessage.find().sort({ createdAt: -1 });
    return NextResponse.json({ contacts });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
      });
    }

    await connectDB();

    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();

    return new Response(JSON.stringify({ message: "Message sent successfully!" }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error saving message:", err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}


