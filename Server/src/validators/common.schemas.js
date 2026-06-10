import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const emailSchema = z.string().trim().email().toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

export const optionalTrimmedString = z
  .string()
  .trim()
  .max(1000)
  .optional()
  .or(z.literal("").transform(() => undefined));
