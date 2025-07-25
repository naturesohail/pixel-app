

import mongoose, { Schema, Document } from 'mongoose';

interface IBid {
  userId: mongoose.Types.ObjectId;
  bidAmount: number;
  createdAt: Date;
  productId?: mongoose.Types.ObjectId;
  status: 'active' | 'won' | 'lost' | 'expired';
}

interface IAuctionZone {
  x: number;
  y: number;
  width: number;
  height: number;
  productIds: mongoose.Types.ObjectId[];
  isEmpty: boolean;
  pixelIndices: number[];
  basePrice?: number;
  currentBid?: number;
  expiryDate?: Date;
  bids: IBid[];
  minimumOrderQuantity:number;
  _id: mongoose.Types.ObjectId;
}

interface IPixelConfig extends Document {
  pricePerPixel: number;
  oneTimePrice: number;
  totalPixels: number;
  availablePixels: number;
  minimumOrderQuantity: number;
  auctionWinDays: number;
  auctionZones: IAuctionZone[];
  activeBidIndices: number[]; 
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bidAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  status: { type: String, enum: ['active', 'won', 'lost', 'expired'], default: 'active' }
});

const AuctionZoneSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  isEmpty: { type: Boolean, default: true },
  pixelIndices: [{ type: Number }],
  basePrice: { type: Number },
  currentBid: { type: Number },
  expiryDate: { type: Date },
  bids: [BidSchema]
}, { _id: true, timestamps: true });

const PixelConfigSchema = new Schema({
  pricePerPixel: { type: Number, default: 0.01 },
  oneTimePrice: { type: Number, default: 0.01 },
  totalPixels: { type: Number, default: 1000000 },
  availablePixels: { type: Number, default: 1000000 },
  minimumOrderQuantity: { type: Number, default: 1 },
  auctionWinDays: { type: Number, default: 2 },
  auctionZones: [AuctionZoneSchema],
  activeBidIndices: [{ type: Number }] 
}, { timestamps: true });

const PixelConfig = mongoose.models.PixelConfig || mongoose.model<IPixelConfig>('PixelConfig', PixelConfigSchema);

export default PixelConfig;