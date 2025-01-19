import { z } from "zod";

// Firestore schema definitions using zod
const UserSchema = z.object({
  uid: z.string(),
  createdAt: z.string().datetime(),
  lastLogin: z.string().datetime(),
});

type User = z.infer<typeof UserSchema>;

const TaskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  completed: z.boolean().default(false),
});

type Task = z.infer<typeof TaskSchema>;

const AIRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  request: z.string(),
  response: z.string().optional(),
  createdAt: z.string().datetime(),
});

type AIRequest = z.infer<typeof AIRequestSchema>;