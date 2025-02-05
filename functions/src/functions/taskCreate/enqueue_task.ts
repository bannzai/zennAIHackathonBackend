import { z } from "zod";
import { TaskCreateSchema } from "./input";
import { DataResponseSchema, ErrorResponseSchema } from "../../entity/response";
import { getFunctions } from "firebase-admin/functions";
import { getFunctionURL } from "../../utils/firebase/gcp";
import { authMiddleware } from "../../utils/middleware/authMiddleware";
import { noAuth, onFlow } from "@genkit-ai/firebase/functions";
import { genkitAI } from "../../utils/ai/ai";

const ResponseSchema = z.union([
  DataResponseSchema.extend({
    data: z.object({
      taskID: z.string(),
    }),
  }),
  ErrorResponseSchema,
]);

export const enqueueTaskCreate = onFlow(
  genkitAI,
  {
    name: "enqueueTaskCreate",
    inputSchema: TaskCreateSchema,
    outputSchema: ResponseSchema,
    authPolicy: noAuth(),
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
