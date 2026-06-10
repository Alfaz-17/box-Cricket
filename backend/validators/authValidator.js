import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
    contactNumber: z.string().regex(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['user', 'admin']).optional(),
    ownerCode: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    contactNumber: z.string().regex(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits'),
    password: z.string().min(1, 'Password is required'),
  }),
});
