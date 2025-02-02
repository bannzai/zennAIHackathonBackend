import { z } from "zod";
import { GroundingDataSchema } from "./grounding_url";
import { TODOSchema } from "./todo";

export const TaskSchema = z.object({
  id: z.string(),
  userID: z.string(),
  question: z.string(),
  aiTextResponse: z.string(),
  todos: z.array(TODOSchema),
  groundings: z.array(GroundingDataSchema),
  completed: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;
