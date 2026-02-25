import { z } from "zod";

export const studentSignupSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one digit"),
    universityId: z.string().min(2, "University id is required"),
    grade: z.coerce.number,
});

export type StudentSignupValues = z.infer<typeof studentSignupSchema>;