import { z } from "zod";

export const AIRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  request: z.string(),
  response: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;