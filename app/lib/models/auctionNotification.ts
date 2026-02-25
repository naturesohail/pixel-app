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

  paymentDeadline?: Date;
  isWinnerActive?: boolean;
  paymentCompleted?: boolean;
}
const AuctionNotificationSchema = new Schema({

  auctionZoneId: {
    type: Schema.Types.ObjectId,
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

  rank: Number,

  notificationType: {
    type: String,
    enum: ['winner','runner_up','participant']
  },

  paymentCompleted: {
    type: Boolean,
    default: false
  },

  isWinnerActive: {
    type: Boolean,
    default: false
  },

  paymentDeadline: Date,

  sent: Boolean,

  scheduledDate: Date,

  sentDate: Date

},{timestamps:true})
export default mongoose.models.AuctionNotification ||
mongoose.model<IAuctionNotification>('AuctionNotification', AuctionNotificationSchema);