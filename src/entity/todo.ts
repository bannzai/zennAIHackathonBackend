import { z } from "zod";
import { GroundingDataSchema } from "./grounding";

export const TODOSchema = z.object({
  id: z.string(),
  userID: z.string(),
  taskID: z.string(),
  content: z.string(),
  supplement: z.string().optional(),
  aiTextResponse: z.string(),
  groundings: z.array(GroundingDataSchema),
});

export type TODO = z.infer<typeof TODOSchema>;
