const mongoose = require("mongoose");
const { Schema } = mongoose;

const bidSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  images: { 
    type: [String], 
    required: true, 
    default: [] 
  },
  url: { 
    type: String 
  },
  category: { 
    type: String, 
    default: 'other' 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  pixelCount: { 
    type: Number, 
    required: true 
  },
  bidAmount: { 
    type: Number, 
    required: true 
  },
  bidIndex: {  // New field to track which product index this bid is for
    type: Number,
    required: true
  },
  isOneTimePurchase: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'paid', 'expired'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  approvedAt: { 
    type: Date 
  },
  paidAt: { 
    type: Date 
  },
  paymentIntentId: { 
    type: String 
  },
  stripeSessionId: { 
    type: String 
  }
}, { timestamps: true });

const Bid = mongoose.models.Bid || mongoose.model("Bid", bidSchema);
module.exports = Bid;