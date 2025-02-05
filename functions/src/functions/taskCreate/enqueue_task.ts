import { z } from "zod";
import { TaskCreateSchema } from "./input";
import { genkitAI } from "../../utils/ai/ai";
import { DataResponseSchema, ErrorResponseSchema } from "../../entity/response";
import { getFunctions } from "firebase-admin/functions";
import { getFunctionURL } from "../../utils/firebase/gcp";
import { authMiddleware } from "../../middleware/authMiddleware";

const ResponseSchema = z.union([
  DataResponseSchema.extend({
    data: z.object({
      taskID: z.string(),
    }),
  }),
  ErrorResponseSchema,
]);

export const enqueueTaskCreate = genkitAI.defineFlow(
  {
    name: "enqueueTaskCreate",
    inputSchema: TaskCreateSchema,
    outputSchema: ResponseSchema,
    middleware: [authMiddleware],
  },
  async (input) => {
    const queue = getFunctions().taskQueue("executeTaskCreate");
    const executeTaskCreateURL = await getFunctionURL("executeTaskCreate");
    queue.enqueue(input, {
      uri: executeTaskCreateURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response: z.infer<typeof ResponseSchema> = {
      result: "OK",
      statusCode: 200,
      data: {
        taskID: "123",
      },
    };

    return response;
  }
);
