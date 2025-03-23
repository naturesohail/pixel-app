import mongoose from "mongoose";

const LoanApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    contactNo: { type: String, required: true },
    employmentType: { type: String, enum: ["yes", "no"], default: "no" },
    itrAmount: { type: Number, required: false },
    grossSalary: { type: Number, required: true },
    netSalary: { type: Number, required: true },
    obligation: { type: Number, required: true },
    age: { type: Number, required: true},
  },
  { timestamps: true }
);

// Prevent model re-compilation in development
export default mongoose.models.LoanApplication ||
 mongoose.model("LoanApplication", LoanApplicationSchema);
