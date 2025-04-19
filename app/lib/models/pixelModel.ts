import mongoose, { Schema, Document } from 'mongoose';

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
  createdAt: Date;
  updatedAt: Date;
}

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
  expiryDate: { type: Date }
}, { _id: true, timestamps: true });

const PixelConfigSchema = new Schema({
  pricePerPixel: { type: Number, default: 0.01 },
  oneTimePrice: { type: Number, default: 0.01 },
  totalPixels: { type: Number, default: 1000000 },
  availablePixels: { type: Number, default: 1000000 },
  minimumOrderQuantity: { type: Number, default: 1 },
  auctionWinDays: { type: Number, default: 2 },
  auctionZones: [AuctionZoneSchema]
}, { timestamps: true });

const PixelConfig = mongoose.models.PixelConfig || mongoose.model<IPixelConfig>('PixelConfig', PixelConfigSchema);

export default PixelConfig;