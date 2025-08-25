import mongoose, { Schema, Document } from 'mongoose';

export interface IAuctionNotification extends Document {
  auctionZoneId: mongoose.Types.ObjectId;
  bidId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rank: number;
  notificationType: 'winner' | 'runner_up' | 'participant';
  sent: boolean;
  scheduledDate: Date;
  sentDate?: Date;
}

const AuctionNotificationSchema = new Schema({
  auctionZoneId: {
    type: Schema.Types.ObjectId,
    ref: 'PixelConfig.auctionZones',
    required: true
  },
  bidId: {
    type: Schema.Types.ObjectId,
    ref: 'Bid',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  notificationType: {
    type: String,
    enum: ['winner', 'runner_up', 'participant'],
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  sentDate: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.models.AuctionNotification || mongoose.model<IAuctionNotification>('AuctionNotification', AuctionNotificationSchema);