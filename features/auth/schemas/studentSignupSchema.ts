import { z } from "zod";

export const studentSignupSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .trim()
    .min(11, "Phone number must be 11 digits")
    .regex(/^01[0-9]{9}$/, "Invalid Egyptian phone number"),
  universityId: z.string().min(1, "University ID is required"),
  level: z.number().int().min(1, "Level 1 min").max(7, "Level 7 max"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one digit"),
});

export type StudentSignupValues = z.infer<typeof studentSignupSchema>;