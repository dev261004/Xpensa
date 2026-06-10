import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    companyName: z.string().min(2, "Company name is required"),
    email: z.string().email("Enter a valid email"),
    country: z.string().min(2, "Country is required"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["Manager", "Employee"]),
  managerId: z.string().optional(),
});

export const expenseSchema = z.object({
  description: z.string().min(3, "Description is required"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(2, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().length(3, "Use a 3-letter currency code"),
  remarks: z.string().optional(),
});
