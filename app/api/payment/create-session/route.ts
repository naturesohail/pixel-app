import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/app/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { getStripeKeys } from "@/app/lib/getStripeKeys";
import Bid from "@/app/lib/models/bidModel"; 

cloudinary.config({
  cloud_name: "dtc1nqk9g",
  api_key: "988391113487354",
  api_secret: "o8IkkQeCn8vFEmG2gI6saI1R6mo",
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { stripeSK } = await getStripeKeys();
    const stripe = new Stripe(stripeSK, { apiVersion: "2025-02-24.acacia" });

    const body = await request.json();
    const {
      userId,
      pixelCount,
      totalPrice,
      productData,
      isOneTimePurchase,
      targetZoneId,
      isWinnerPayment,
      bidId,
      zoneId,
      bidAmount,
    } = body;

    // Process images
    const processedImages: string[] = [];
    for (const image of productData.images) {
      if (image.startsWith("data:image")) {
        const result = await cloudinary.uploader.upload(image, {
          folder: `pixel-products/${userId}`,
        });
        processedImages.push(result.secure_url);
      } else if (image.startsWith("http")) {
        processedImages.push(image);
      }
    }

    // Common metadata
    let metadata: any = {
      userId,
      pixelCount: pixelCount.toString(),
      title: productData.title || "",
      url: productData.url || "",
      imageCount: processedImages.length.toString(),
      images: JSON.stringify(processedImages),
    };

    let lineItems: any[] = [];
    let productName = "";
    let paymentAmount = 0;

    // Handle winner bid payment
    if (isWinnerPayment && bidId) {
      // Validate winning bid
      const bid = await Bid.findById(bidId);
      if (!bid) {
        return NextResponse.json(
          { error: "Bid not found" },
          { status: 404 }
        );
      }
      
      if (bid.userId.toString() !== userId) {
        return NextResponse.json(
          { error: "You are not authorized to pay for this bid" },
          { status: 403 }
        );
      }

      // Check if already paid
      if (bid.paid) {
        return NextResponse.json(
          { error: "This bid has already been paid" },
          { status: 400 }
        );
      }

      // Use bid amount for payment
      paymentAmount = bidAmount || totalPrice;
      productName = `Winning Bid - ${productData.title || 'Auction Zone'}`;
      
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: { name: productName },
          unit_amount: Math.round(paymentAmount * 100),
        },
        quantity: 1,
      }];

      // Add winner-specific metadata
      metadata = {
        ...metadata,
        paymentType: "winner-bid",
        bidId,
        zoneId,
        totalPrice: paymentAmount.toString(),
      };
    } 
    // Handle one-time purchase
    else {
      if (processedImages.length === 0) {
        return NextResponse.json(
          { error: "At least one product image is required" },
          { status: 400 }
        );
      }

      paymentAmount = totalPrice;
      productName = `${productData.title} (${pixelCount} pixels)`;
      
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: { name: productName },
          unit_amount: Math.round(paymentAmount * 100),
        },
        quantity: 1,
      }];

      // Add one-time purchase metadata
      metadata = {
        ...metadata,
        paymentType: "one-time",
        totalPrice: paymentAmount.toString(),
        isOneTimePurchase: isOneTimePurchase ? "true" : "false",
        targetZoneId: targetZoneId || "",
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe session" }, 
      { status: 500 }
    );
  }
}
