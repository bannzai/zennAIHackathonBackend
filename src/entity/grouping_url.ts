import { z } from "zod";

export const GroundingDataSchema = z.object({
  url: z.string(),
  title: z.string(),
  index: z.number().optional(),
});

export type GroundingData = z.infer<typeof GroundingDataSchema>;
