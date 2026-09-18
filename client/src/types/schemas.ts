import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Must contain a letter')
      .regex(/\d/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const uploadDocumentSchema = z.object({
  subject: z.string().optional(),
  description: z.string().max(500).optional(),
});

export const generateQuizSchema = z.object({
  documentId: z.string().optional(),
  topic: z.string().max(100).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questionCount: z.coerce.number().min(3).max(30).default(10),
});

export const createChatSchema = z.object({
  content: z.string().min(1, 'Type a message').max(4000),
});

export const createNoteSchema = z.object({
  title: z.string().max(160).optional(),
  body: z.string().optional(),
});
