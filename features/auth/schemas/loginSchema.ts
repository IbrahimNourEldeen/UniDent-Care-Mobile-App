import { z } from 'zod';

const phoneRegex = /^[0-9]{10,14}$/;

export const loginSchema = z.object({
    email: z.string()
        .min(1, "Email or Phone number is required")
        .refine((value) => {
            const isEmail = z.string().email().safeParse(value).success;
            const isPhone = phoneRegex.test(value);
            return isEmail || isPhone;
        }, {
            message: "Please enter a valid email address or phone number"
        }),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginFormValues = z.infer<typeof loginSchema>;