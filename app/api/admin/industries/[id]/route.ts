import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Industry from "@/app/lib/models/industryModel";
import { authenticate } from "@/app/utills/auth/authenticate";


export async function GET(request: Request, { params }: any) {
  try {
    await dbConnect();
    const industry = await Industry.findById(params.id);

    if (!industry) {
      return NextResponse.json({ error: "Industry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, industry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: any) {
  try {
    await authenticate();
    await dbConnect();

    const { industry } = await request.json();
    if (!industry) {
      return NextResponse.json({ error: "Industry name is required" }, { status: 400 });
    }

    const updatedIndustry = await Industry.findByIdAndUpdate(
      params.id,
      { industry },
      { new: true }
    );

    if (!updatedIndustry) {
      return NextResponse.json({ error: "Industry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, industry: updatedIndustry });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
