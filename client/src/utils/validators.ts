import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['student', 'faculty']).default('student'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const quizSettingsSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().min(1).max(50).default(10),
})

export const highlightSchema = z.object({
  text: z.string().min(1),
  color: z.string().default('#fef08a'),
  page: z.number().min(0),
})
