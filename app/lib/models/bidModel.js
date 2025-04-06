import mongoose from 'mongoose';


const BidSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  totalPixels: { type: Number, required: true },
  bidAmount: { type: Number, required: true },
  status: {
    type: String,
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
   
const Bid = mongoose.models.Bid || mongoose.model('Bid', BidSchema,"bids");
export default Bid;
