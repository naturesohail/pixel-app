

// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import dbConnect from "@/app/lib/db";
// import Product from "@/app/lib/models/productModel";
// import PixelConfig from "@/app/lib/models/pixelModel";
// import mongoose, { Types } from "mongoose";
// const stripe = new Stripe(
//   "sk_test_51R7u7XFWt2YrxyZwTMNvSl4gAgizA6e01XBp4sQGhLFId0qKAH1QdI2jFhlaFtHU9sMuPNHh8XvhB7DDQlfCnYiw00GsRA8POr",
//   {
//     apiVersion: "2025-02-24.acacia",
//   }
// );
// type ProductMetadata = {
//   userId: string;
//   pixelCount: string;
//   title: string;
//   url: string;
//   images: string;
//   totalPrice: string;
//   isOneTimePurchase: string;
//   targetZoneId: string;
// };

// export async function POST(request: Request) {
//   let dbSession;
//   try {
//     await dbConnect();
//     const { sessionId } = await request.json();

//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     if (session.payment_status !== "paid") {
//       throw new Error("Payment not completed");
//     }

//     const metadata = session.metadata as ProductMetadata;
//     if (!metadata) throw new Error("Missing metadata");

//     const userId = metadata.userId;
//     const pixelCount = parseInt(metadata.pixelCount, 10);
//     const title = metadata.title;
//     const url = metadata.url;
//     const totalPrice = parseFloat(metadata.totalPrice);
//     const isOneTimePurchase = metadata.isOneTimePurchase === "true";
//     const targetZoneId = metadata.targetZoneId;
//     const rawImages: string[] = JSON.parse(metadata.images);

//     dbSession = await mongoose.startSession();
//     dbSession.startTransaction();

//     const config = await PixelConfig.findOne().sort({ createdAt: -1 }).session(dbSession);
//     if (!config) throw new Error("Pixel config not found");

//     // Allocate pixels
//     const availablePixels = config.auctionZones.flatMap((zone: any) => zone.pixelIndices || []);
//     const usedPixels = (await Product.find({ status: "active" })).flatMap(p => p.pixelIndices || []);
//     const allocatablePixels = availablePixels.filter((p:any) => !usedPixels.includes(p));
//     const allocatedPixels = allocatablePixels.slice(0, pixelCount);

//     // if (allocatedPixels.length < pixelCount) {
//     //   throw new Error(`Not enough pixels available (${allocatedPixels.length}/${pixelCount})`);
//     // }

    

//     // Create Product
//     const [product] = await Product.create([
//       {
//         title,
//         price: totalPrice,
//         images: rawImages,
//         url,
//         owner: new Types.ObjectId(userId),
//         zoneId: new Types.ObjectId(targetZoneId),
//         status: "active",
//         purchaseType: isOneTimePurchase ? "one-time" : "bid",
//         expiryDate: isOneTimePurchase
//           ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
//           : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         pixelCount,
//         pixelIndices: allocatedPixels,
//         pixelIndex: allocatedPixels[0],
//       },
//     ], { session: dbSession });

//     // Update zone
//     await PixelConfig.updateOne(
//       {},
//       {
//         $set: {
//           "auctionZones.$[zone].status": "sold",
//           "auctionZones.$[zone].isEmpty": false,
//         },
//         $inc: { availablePixels: -pixelCount },
//       },
//       {
//         session: dbSession,
//         arrayFilters: [{ "zone._id": new mongoose.Types.ObjectId(targetZoneId) }],
//       }
//     );

//     await dbSession.commitTransaction();
//     return NextResponse.json({ success: true, productId: product._id });
//   } catch (error) {
//     if (dbSession) await dbSession.abortTransaction();
//     console.error("Payment verification failed:", error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "Unknown error" },
//       { status: 500 }
//     );
//   } finally {
//     if (dbSession) dbSession.endSession();
//   }
// }




import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/app/lib/db";
import Product from "@/app/lib/models/productModel";
import PixelConfig from "@/app/lib/models/pixelModel";
import Transaction from "@/app/lib/models/transactionModel";
import mongoose, { Types } from "mongoose";

const stripe = new Stripe(
  "sk_test_51R7u7XFWt2YrxyZwTMNvSl4gAgizA6e01XBp4sQGhLFId0qKAH1QdI2jFhlaFtHU9sMuPNHh8XvhB7DDQlfCnYiw00GsRA8POr",
  {
    apiVersion: "2025-02-24.acacia",
  }
);

type ProductMetadata = {
  userId: string;
  pixelCount: string;
  title: string;
  url: string;
  images: string;
  totalPrice: string;
  isOneTimePurchase: string;
  targetZoneId: string;
};

export async function POST(request: Request) {
  let dbSession;
  try {
    await dbConnect();
    const { sessionId } = await request.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const metadata = session.metadata as ProductMetadata;
    if (!metadata) throw new Error("Missing metadata");

    const userId = metadata.userId;
    const pixelCount = parseInt(metadata.pixelCount, 10);
    const title = metadata.title;
    const url = metadata.url;
    const totalPrice = parseFloat(metadata.totalPrice);
    const isOneTimePurchase = metadata.isOneTimePurchase === "true";
    const targetZoneId = metadata.targetZoneId;
    const rawImages: string[] = JSON.parse(metadata.images);

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const config = await PixelConfig.findOne().sort({ createdAt: -1 }).session(dbSession);
    if (!config) throw new Error("Pixel config not found");

    // Allocate pixels
    const availablePixels = config.auctionZones.flatMap((zone: any) => zone.pixelIndices || []);
    const usedPixels = (await Product.find({ status: "active" })).flatMap(p => p.pixelIndices || []);
    const allocatablePixels = availablePixels.filter((p:any) => !usedPixels.includes(p));
    const allocatedPixels = allocatablePixels.slice(0, pixelCount);

    // Create Product
    const [product] = await Product.create([{
      title,
      price: totalPrice,
      images: rawImages,
      url,
      owner: new Types.ObjectId(userId),
      zoneId: new Types.ObjectId(targetZoneId),
      status: "active",
      purchaseType: isOneTimePurchase ? "one-time" : "bid",
      expiryDate: isOneTimePurchase
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      pixelCount,
      pixelIndices: allocatedPixels,
      pixelIndex: allocatedPixels[0],
    }], { session: dbSession });

    // Create Transaction record
    const transaction=await Transaction.create([{
      userId: new Types.ObjectId(userId),
      productId: product._id,
      amount: totalPrice,
      pixelCount,
      status: "completed",
      stripeSessionId: sessionId,
    }], { session: dbSession });

    // Update zone
    await PixelConfig.updateOne(
      {},
      {
        $set: {
          "auctionZones.$[zone].status": "sold",
          "auctionZones.$[zone].isEmpty": false,
        },
        $inc: { availablePixels: -pixelCount },
      },
      {
        session: dbSession,
        arrayFilters: [{ "zone._id": new mongoose.Types.ObjectId(targetZoneId) }],
      }
    );

    await dbSession.commitTransaction();
    return NextResponse.json({ 
      success: true, 
      productId: product._id,
      transactionId: transaction?._id
    });
  } catch (error) {
    if (dbSession) await dbSession.abortTransaction();
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    if (dbSession) dbSession.endSession();
  }
}
