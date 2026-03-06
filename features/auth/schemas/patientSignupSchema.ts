import { z } from "zod";

export const patientSignupSchema = z.object({
    fullName: z.string()
        .min(3, "Full name must be at least 3 characters")
        .max(50, "Full name is too long"),
    
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one digit"),
    
    phoneNumber: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^01[0-9]{9}$/, "Invalid Egyptian phone number"), 
    
    nationalId: z.string()
        .length(14, "National ID must be exactly 14 digits"),
    
    birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date of birth",
    }),
    
    gender: z.number().int().min(0).max(1), 
    
    city: z.number().int().min(0, "Please select a city"),
});

export type PatientSignupValues = z.infer<typeof patientSignupSchema>;