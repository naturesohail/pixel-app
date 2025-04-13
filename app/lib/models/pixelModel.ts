// pixelModel.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

if (mongoose.models.PixelConfig) {
  mongoose.deleteModel('PixelConfig');
}

export interface IPixelConfig extends Document {
  pricePerPixel: number;
  oneTimePrice: number;
  totalPixels: number;
  availablePixels: number;
  minimumOrderQuantity: number; // New field
  auctionWinDays: number; // New field
  createdAt: Date;
  updatedAt: Date;
}

const PixelConfigSchema: Schema = new Schema({
  pricePerPixel: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  oneTimePrice: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  totalPixels: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1000000
  },
  availablePixels: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderQuantity: { // New field
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  auctionWinDays: { // New field
    type: Number,
    required: true,
    min: 1,
    default: 2
  }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

PixelConfigSchema.index({ pricePerPixel: 1, oneTimePrice: 1 });

const PixelConfig = mongoose.model<IPixelConfig>('PixelConfig', PixelConfigSchema);
export default PixelConfig;