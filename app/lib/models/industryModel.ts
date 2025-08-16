import mongoose, { Schema, Document } from "mongoose";

export interface IIndustry extends Document {
  industry: string;
}

const industrySchema = new Schema<IIndustry>({
    industry: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Industry ||
  mongoose.model<IIndustry>("Industry", industrySchema);
