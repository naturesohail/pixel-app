import mongoose, { Document, Schema, Types } from 'mongoose';

interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  images: string[];
  url: string;
  owner: Types.ObjectId;
  pixelCount: number;
  pixelIndices: number[];
  pixelIndex: number;
  status: 'pending' | 'active' | 'expired' | 'sold';
  purchaseType: 'one-time' | 'bid';
  expiryDate: Date;
  zoneId?: Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  url: { type: String, default: '' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  zoneId: { type: Schema.Types.ObjectId, ref: 'PixelConfig.auctionZones' }, // Reference to zone
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'sold'],
    default: 'pending'
  },
  purchaseType: {
    type: String,
    enum: ['one-time', 'bid'],
    required: true
  },
  expiryDate: { type: Date, required: true }
}, { timestamps: true });

// Indexes for optimized queries
ProductSchema.index({ pixelIndices: 1 });
ProductSchema.index({ pixelIndex: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ owner: 1 });
ProductSchema.index({ zoneId: 1 });  // Index for zone reference

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;