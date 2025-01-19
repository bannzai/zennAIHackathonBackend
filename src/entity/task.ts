import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  completed: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;