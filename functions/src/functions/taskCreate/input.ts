import { z } from "zod";
import { UserRequestSchema } from "../../entity/userRequest";

export const TaskCreateSchema = z.object({
  question: z.string(),
  userRequest: UserRequestSchema,
});
