import mongoose, { Document, Schema, Types } from 'mongoose';

interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  url: string;
  owner: Types.ObjectId;
  pixelCount: number;
  status: 'pending' | 'active' | 'cancelled' | 'failed' | 'won';
  purchaseType: 'one-time' | 'bid';
  pixelIndex: number;
  expiryDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'other' },
  images: { type: [String], required: true },
  url: { type: String, default: '' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pixelCount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'cancelled', 'failed','won'],
    default: 'pending'
  },
  purchaseType: {
    type: String,
    enum: ['one-time', 'bid'],
    required: true
  },
  pixelIndices: { type: [Number], required: true }, // Array of pixel indices
  pixelIndex: { type: Number, required: true }, // First pixel index (backward compatibility)
  expiryDate: { type: Date, required: true }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;