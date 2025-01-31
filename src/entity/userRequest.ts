import { z } from "zod";

export const UserRequestSchema = z.object({
  userID: z.string(),
  requestDateTime: z.date(),
  request: z.string(),
});

export type UserRequest = z.infer<typeof UserRequestSchema>;
