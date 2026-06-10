import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, trim: true },
    convertedAmount: { type: Number },
    convertedCurrency: { type: String, uppercase: true },
    conversionRate: { type: Number },
    conversionDate: { type: Date },
    category: { type: String, required: true, trim: true },
    remarks: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Draft", "Waiting approval", "Approved", "Rejected"],
      default: "Draft",
      index: true,
    },
    paidBy: {
      type: String,
    },
    managerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    currentApproverId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    submittedAt: { type: Date },
    receipt: {
      filename: String,
      originalName: String,
      path: String,
      mimeType: String,
      size: Number,
    },
    ocr: {
      rawText: String,
      extracted: {
        amount: Number,
        date: Date,
        description: String,
        category: String,
        vendor: String,
      },
      processedAt: Date,
    },
    approvalSteps: [
      {
        approverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        approverName: String,
        approverRole: String,
        type: {
          type: String,
          enum: ["Manager", "Approver"],
          default: "Approver",
        },
        sequence: { type: Number, required: true },
        required: { type: Boolean, default: false },
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected", "Skipped"],
          default: "Pending",
        },
        comment: String,
        actedAt: Date,
      },
    ],
    approvalHistory: [
      {
        action: {
          type: String,
          enum: ["Submitted", "Approved", "Rejected", "Auto approved", "Override"],
          required: true,
        },
        actorId: { type: Schema.Types.ObjectId, ref: "User" },
        actorName: String,
        actorRole: String,
        comment: String,
        fromStatus: String,
        toStatus: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    adminOverride: {
      by: { type: Schema.Types.ObjectId, ref: "User" },
      action: { type: String, enum: ["Approved", "Rejected"] },
      comment: String,
      at: Date,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ companyId: 1, status: 1, currentApproverId: 1 });
expenseSchema.index({ employeeId: 1, createdAt: -1 });

export const Expense = mongoose.model("Expense", expenseSchema);
