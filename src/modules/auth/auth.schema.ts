import { z } from 'zod';

export const registerSchema = z.object({
    full_name: z.string().min(2).max(150),
    university_id: z.string().min(3).max(30),
    email: z.string().email().max(255),
    password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
    department_id: z.string().uuid().optional().nullable(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const changePasswordSchema = z.object({
    current_password: z.string().min(1),
    new_password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
});

export const refreshSchema = z.object({
    refresh_token: z.string().min(1),
});
