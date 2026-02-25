import { z } from "zod";

export const doctorSignupSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one digit"),
    specialty: z.string().min(2, "Specialty is required"),
    universityId: z.coerce.number(),
});

export type DoctorSignupValues = z.infer<typeof doctorSignupSchema>;