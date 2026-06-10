import { z } from "zod";
import { objectIdSchema, optionalTrimmedString } from "./common.schemas.js";

export const expensePayloadSchema = z.object({
  description: z.string().trim().min(3).max(180),
  date: z.coerce.date(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().trim().length(3).toUpperCase(),
  category: z.string().trim().min(2).max(60),
  remarks: optionalTrimmedString,
  receipt: z
    .object({
      filename: z.string().optional(),
      originalName: z.string().optional(),
      path: z.string().optional(),
      mimeType: z.string().optional(),
      size: z.number().optional(),
    })
    .optional(),
  ocr: z
    .object({
      rawText: z.string().optional(),
      extracted: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
});

export const createExpenseSchema = z.object({
  body: expensePayloadSchema,
});

export const expenseIdParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

export const expenseActionSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    action: z.enum(["Approved", "Rejected"]),
    comment: z.string().trim().min(2).max(500),
  }),
});

export const adminOverrideSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    action: z.enum(["Approved", "Rejected"]),
    comment: z.string().trim().min(3).max(500),
  }),
});
