import mongoose, { Schema } from "mongoose";

const approvalRuleSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
      index: true,
    },
    managerFirst: { type: Boolean, default: true },
    ruleType: {
      type: String,
      enum: ["percentage", "specific", "hybrid"],
      default: "percentage",
    },
    minimumPercentage: { type: Number, min: 1, max: 100, default: 100 },
    specificApproverId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    approvers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        sequence: { type: Number, required: true },
        required: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ApprovalRule = mongoose.model("ApprovalRule", approvalRuleSchema);
