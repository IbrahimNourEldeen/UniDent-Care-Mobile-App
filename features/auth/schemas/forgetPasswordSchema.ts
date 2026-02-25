import z, { email } from "zod";

export const forgetPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address")
})
export type ForgetPasswordValues = z.infer<typeof forgetPasswordSchema>;