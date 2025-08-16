

import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/app/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { getStripeKeys } from "@/app/lib/getStripeKeys";

cloudinary.config({
  cloud_name: "dtc1nqk9g",
  api_key: "988391113487354",
  api_secret: "o8IkkQeCn8vFEmG2gI6saI1R6mo",
});
  const { stripeSK } = await getStripeKeys();

const stripe = new Stripe(
  stripeSK,
  {
    apiVersion: "2025-02-24.acacia",
  }
);
export async function POST(request: Request) {
  try {
    await dbConnect();

    const {
      userId,
      pixelCount,
      totalPrice,
      productData,
      isOneTimePurchase,
      targetZoneId,
      images, 
    } = await request.json();

    
  
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

    if (processedImages.length === 0) {
      throw new Error("At least one product image is required");
    }
    // if (uploadedImages.length === 0) {
    //   return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    // }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${productData.title} (${pixelCount} pixels)`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        userId,
        pixelCount: pixelCount.toString(),
        title: productData.title,
        url: productData.url || "",
        totalPrice: totalPrice.toString(),
        isOneTimePurchase: isOneTimePurchase ? "true" : "false",
        targetZoneId,
        images: JSON.stringify(processedImages),
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 });
  }
}
