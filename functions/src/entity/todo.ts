import { z } from "zod";
import { GroundingDataSchema } from "./grounding";
import { ServerTimestampSchema } from "./util/timestamp";
import { LocationSchema } from "./location";

export const TODOSchema = z
  .object({
    id: z.string(),
    userID: z.string(),
    taskID: z.string(),
    content: z.string().describe("TODOの内容"),
    supplement: z.string().describe("補足情報"),
    aiTextResponseMarkdown: z.string().nullable(),
    groundings: z.array(GroundingDataSchema).nullable(),
    locations: z.array(LocationSchema),
  })
  .merge(ServerTimestampSchema);

export type TODO = z.infer<typeof TODOSchema>;
