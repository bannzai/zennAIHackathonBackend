import { z } from "zod";
import { GroundingDataSchema } from "./grounding";

export const TaskSchema = z.object({
  id: z.string(),
  userID: z.string(),
  question: z.string(),
  aiTextResponse: z.string(),
  groundings: z.array(GroundingDataSchema),
  completed: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;
