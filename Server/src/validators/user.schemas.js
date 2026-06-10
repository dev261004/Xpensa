import { z } from "zod";
import { emailSchema, objectIdSchema, passwordSchema } from "./common.schemas.js";

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string(),
      country: z.string().trim().min(2).max(80),
      companyName: z.string().trim().min(2).max(120).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    tempPassword: z.string().min(1, "Temporary password is required"),
    newPassword: passwordSchema,
  }),
});

export const createAdminUserSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80),
      email: emailSchema,
      role: z.enum(["Manager", "Employee"]),
      managerId: objectIdSchema.optional().or(z.literal("").transform(() => undefined)),
    })
    .refine((data) => data.role !== "Employee" || Boolean(data.managerId), {
      path: ["managerId"],
      message: "Employee must have a manager assigned",
    }),
});

export const updateAdminUserSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      email: emailSchema.optional(),
      role: z.enum(["Manager", "Employee"]).optional(),
      managerId: objectIdSchema.nullish().or(z.literal("").transform(() => null)),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
});

export const deleteAdminUserSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});
