import { NextResponse } from "next/server";
import Bid from "@/app/lib/models/bidModel";
import User from "@/app/lib/models/userModel";
import dbConnect from "@/app/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sendEmail, bidNotificationTemplate } from "@/app/lib/email";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const authToken = (await cookieStore).get("authToken")?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(authToken, process.env.JWT_SECRET!);
    await dbConnect();

    const body = await request.json();
    const { zoneId, bidAmount, pixelCount } = body;

    if (!zoneId || bidAmount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const highestBid = await Bid.findOne({ zoneId }).sort({ bidIndex: -1 });
    const nextBidIndex = highestBid ? highestBid.bidIndex + 1 : 1;

    const newBid = new Bid({
      title: "",
      description: "",
      images: [],
      url: "",
      category: "other",
      userId: decoded.id,
      zoneId,
      pixelCount,
      bidAmount,
      bidIndex: nextBidIndex,
      isOneTimePurchase: false,
      status: "pending"
    });

    await newBid.save();

    notifyOtherBidders(zoneId, decoded.id, bidAmount).catch(error => {
      console.error("Bid notification error:", error);
    });

    return NextResponse.json({
      success: true,
      bid: newBid,
      bidIndex: nextBidIndex
    });

  } catch (error) {
    console.error("Error placing bid:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to place bid",
      },
      { status: 500 }
    );
  }
}

async function notifyOtherBidders(zoneId: string, currentBidderId: string, newBidAmount: number) {
  try {
    await dbConnect();
    
    const bidUserIds = await Bid.distinct("userId", {
      zoneId,
      userId: { $ne: currentBidderId },
      status: "pending"
    });

    if (bidUserIds.length === 0) return;

    const users = await User.find(
      { _id: { $in: bidUserIds } },
      { email: 1 }
    );

    if (users.length === 0) return;

    const uniqueEmails = [...new Set(users.map(user => user.email))];
    
    const subject = `New Bid on Zone ${zoneId} - You've Been Outbid!`;
    const htmlContent = bidNotificationTemplate(zoneId, newBidAmount);
    
    const emailPromises = uniqueEmails.map(email => 
      sendEmail({
        to: email,
        subject,
        text: `A new bid of $${newBidAmount.toFixed(2)} has been placed on zone ${zoneId}.`,
        html: htmlContent
      })
    );

    await Promise.allSettled(emailPromises);
    
    console.log(`Sent notifications to ${uniqueEmails.length} bidders`);
  } catch (error) {
    console.error("Error in notifyOtherBidders:", error);
    throw error;
  }
}