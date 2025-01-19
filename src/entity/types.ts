import { z } from 'zod';

export const UserSchema = z.object({
  uid: z.string(),
  createdAt: z.string().datetime(),
  lastLogin: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  completed: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;

export const AIRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  request: z.string(),
  response: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;