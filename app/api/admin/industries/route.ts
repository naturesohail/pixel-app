import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Industry from "@/app/lib/models/industryModel";
import { authenticate } from "@/app/utills/auth/authenticate";


export async function GET() {
  try {
    await dbConnect();
    const industries = await Industry.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, industries });
  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await authenticate();
    await dbConnect();

    const { industry } = await request.json();
    if (!industry) {
      return NextResponse.json({ error: "Industry name is required" }, { status: 400 });
    }

    const newIndustry = await Industry.create({ industry });
    return NextResponse.json({ success: true, industry: newIndustry });
  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
