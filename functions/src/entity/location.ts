import { z } from "zod";

export const LocationSchema = z.object({
  name: z.string(),
  address: z.string(),
  email: z.string(),
  tel: z.string(),
});
