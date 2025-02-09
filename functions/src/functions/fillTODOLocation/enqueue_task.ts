import { z } from "zod";
import { FillTODOLocationSchema } from "./input";
import { DataResponseSchema, ErrorResponseSchema } from "../../entity/response";
import { getFunctions } from "firebase-admin/functions";
import { getFunctionURL } from "../../utils/firebase/gcp";
import { onFlow } from "@genkit-ai/firebase/functions";
import { genkitAI } from "../../utils/ai/ai";
import { appAuthPolicy } from "../../utils/ai/authPolicy";

const ResponseSchema = z.union([
  DataResponseSchema.extend({
    data: z.object({
      taskID: z.string(),
    }),
  }),
  ErrorResponseSchema,
]);

export const enqueueFillTODOLocation = onFlow(
  genkitAI,
  {
    name: "enqueueFillTODOLocation",
    inputSchema: FillTODOLocationSchema,
    outputSchema: ResponseSchema,
    authPolicy: appAuthPolicy("enqueueFillTODOLocation"),
  },
  async (input) => {
    const queue = getFunctions().taskQueue("executeFillTODOLocation");
    const executeFillTODOLocationURL = await getFunctionURL(
      "executeFillTODOLocation"
    );
    queue.enqueue(input, {
      uri: executeFillTODOLocationURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response: z.infer<typeof ResponseSchema> = {
      result: "OK",
      statusCode: 200,
      data: {
        taskID: input.taskID,
      },
    };

    return response;
  }
);
