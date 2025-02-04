import { z } from "zod";
import { GroundingDataSchema } from "./grounding";

export const TODOSchema = z.object({
  id: z.string(),
  userID: z.string(),
  taskID: z.string(),
  content: z.string().describe("TODOの内容"),
  supplement: z.string().describe("補足情報"),
  aiTextResponse: z.string(),
  groundings: z.array(GroundingDataSchema),
});

export type TODO = z.infer<typeof TODOSchema>;
