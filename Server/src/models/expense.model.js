import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true }, // e.g., USD, INR
    category: { type: String, required: true }, 
    remarks: { type: String },
    status: {
      type: String,
      enum: ["Draft", "Processing", "Approved", "Rejected"],
      default: "Draft",
    },
    paidBy: {
      type: String, // logged-in employee’s name
    },
    managerId: { type: Schema.Types.ObjectId, ref: "User" }, // optional for approval workflow
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.model("Expense", expenseSchema);
