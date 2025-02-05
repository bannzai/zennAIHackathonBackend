import { z } from "zod";

export const TaskCreateSchema = z.object({
  question: z.string(),
});
