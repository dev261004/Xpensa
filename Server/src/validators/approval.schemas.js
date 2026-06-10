import { z } from "zod";
import { objectIdSchema } from "./common.schemas.js";

export const approvalRuleSchema = z.object({
  body: z.object({
    managerFirst: z.boolean().default(true),
    ruleType: z.enum(["percentage", "specific", "hybrid"]).default("percentage"),
    minimumPercentage: z.coerce.number().int().min(1).max(100).default(100),
    specificApproverId: objectIdSchema.nullish().or(z.literal("").transform(() => null)),
    approvers: z
      .array(
        z.object({
          userId: objectIdSchema,
          sequence: z.coerce.number().int().min(1),
          required: z.boolean().default(false),
        })
      )
      .default([]),
    isActive: z.boolean().default(true),
  }),
});
