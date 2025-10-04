import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    currency: { type: String, required: true }, // e.g. "INR"
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
