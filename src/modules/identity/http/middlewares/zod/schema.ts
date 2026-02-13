import { z } from 'zod';

export const RegisterSchema = z.object({
        email: z.email('Invalid email format'),
        firstName: z.string().min(2, 'First name is too short , must be a minimum of 3 characters'),
        lastName: z.string().min(2, 'Last name is too short must be a minimum of 3 characters'),
        password: z.string().min(8, 'Password must be at least 8 characters')
});

export const LoginSchema = z.object({
        email: z.email('Invalid email format'),
        password: z.string().min(1, 'Password is required')
});

export const ForgotPasswordSchema = z.object({
        email: z.email('Invalid email format')
});

export const ResetPasswordSchema = z.object({
        // Note: z.string().min() is still valid for non-formatted strings
        token: z.string().min(1, 'Token is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

export const LogoutSchema = z.object({
        userId: z.uuid('Invalid user ID format'), // Use top-level z.uuid()
        refreshToken: z.string().min(1, 'Refresh token is required')
});
