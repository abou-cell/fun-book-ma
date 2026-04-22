import { UserRole } from "@prisma/client";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number");

export const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address").transform((value) => value.toLowerCase()),
  password: passwordSchema,
  role: z.enum([UserRole.CLIENT, UserRole.PROVIDER]).default(UserRole.CLIENT),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});
