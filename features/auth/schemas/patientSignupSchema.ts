import z from "zod";

export const patientSignupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one digit"),
    phoneNumber: z.string().min(10, "Invalid phone number"),
    nationalId: z.string().length(14, "National ID must be 14 digits"),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), {
        message: "Invalid date of birth",
    }),
    gender: z.coerce.number,
})

export type PatientSignupValues = z.infer<typeof patientSignupSchema>