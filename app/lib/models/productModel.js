import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  totalPixel:{type:String},
  biddingEndTime:{type:String},
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  auctionType: { type: String, enum: ["buy-now", "auction"], required: true },
  currentBid: { type: Number, default: 0 },
  status: { type: String, enum: ["available", "sold"], default: "available" },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
