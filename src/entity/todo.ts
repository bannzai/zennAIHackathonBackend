import { z } from "zod";
import { GroundingDataSchema } from "./grouping_url";

export const TODOSchema = z.object({
  id: z.string(),
  userID: z.string(),
  taskID: z.string(),
  content: z.string(),
  supplement: z.string().optional(),
  aiTextResponse: z.string(),
  groundings: z.array(GroundingDataSchema),
});

export const TODOBodySchema = TODOSchema.pick({
  content: true,
  supplement: true,
  aiTextResponse: true,
  groundings: true,
});

export type TODO = z.infer<typeof TODOSchema>;
