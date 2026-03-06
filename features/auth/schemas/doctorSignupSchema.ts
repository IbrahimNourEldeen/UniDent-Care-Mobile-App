import { z } from "zod";

export const doctorSignupSchema = z.object({
    fullName: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name is too long"),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .regex(/^[a-zA-Z][a-zA-Z0-9_]+$/, "Username must start with a letter and contain only letters/numbers"),
    email: z.string().email("Invalid email address"),
    phone: z.string()
        .regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone format (e.g., +1234567890)"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one digit"),
    specialty: z.string().min(2, "Specialty is required"),
    universityId: z.string().min(7, "University ID must be at least 7 characters")
});

export type DoctorSignupValues = z.infer<typeof doctorSignupSchema>;