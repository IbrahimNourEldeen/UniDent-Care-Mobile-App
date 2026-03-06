import { z } from "zod";

export const studentSignupSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one digit"),
    universityId: z.string().min(2, "University id is required"),
    university: z.string().min(2, "University is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    level: z.number({ message: "Level is required" }).int().min(1, "Level is required").max(7, "Level must be between 1 and 7"),
    phone: z.string().trim().min(11, "Phone number must be at least 11 digits").regex(/^01[0-9]{9}$/, "Invalid Egyptian phone number"),
});

export type StudentSignupValues = z.infer<typeof studentSignupSchema>;