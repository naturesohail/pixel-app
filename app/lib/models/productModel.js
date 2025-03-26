import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  xPosition: { type: Number, required: true },
  yPosition: { type: Number, required: true },
  width: { type: Number, default: 1 },
  height: { type: Number, default: 1 },
  auctionType: { type: String, enum: ["buy-now", "auction"], required: true },
  currentBid: { type: Number, default: 0 },
  status: { type: String, enum: ["available", "sold"], default: "available" },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
