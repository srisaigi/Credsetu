import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const loginSchema = z.object({
  phoneNumber: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
});

export const otpSchema = z.object({
  phoneNumber: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
  otp: z.string().trim().length(6, 'OTP must be 6 digits'),
});

export const loanCreateSchema = z.object({
  friendName: z.string().trim().min(2, 'Friend name is required'),
  phoneNumber: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  dueDate: z.string().min(1, 'Due date is required'),
  receiptUrl: z.string().url().optional().or(z.literal('')).nullable().transform((value) => value || null),
});

export const validate = (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(', ');
    return res.status(400).json({ error: message });
  }

  req.body = result.data;
  next();
};
