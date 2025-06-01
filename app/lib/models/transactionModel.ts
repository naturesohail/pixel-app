import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  amount: number;
  pixelCount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionDate: Date;
  stripeSessionId?: string;
}

const TransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  amount: { type: Number, required: true },
  pixelCount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, default: 'stripe' },
  transactionDate: { type: Date, default: Date.now },
  stripeSessionId: { type: String }
});

export default mongoose.models.Transaction || 
  mongoose.model<ITransaction>('Transaction', TransactionSchema);