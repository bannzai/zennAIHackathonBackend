import { z } from "zod";
import { TaskCreateSchema } from "./input";
import { DataResponseSchema, ErrorResponseSchema } from "../../entity/response";
import { getFunctions } from "firebase-admin/functions";
import { getFunctionURL } from "../../utils/firebase/gcp";
import { onFlow } from "@genkit-ai/firebase/functions";
import { genkitAI } from "../../utils/ai/ai";
import { appAuthPolicy } from "../../utils/ai/authPolicy";
import { database } from "../../utils/firebase/firebase";
import { TaskPreparing } from "../../entity/task";
import { firestoreTimestampJSON } from "../../entity/util/timestamp";
import { Timestamp } from "firebase-admin/firestore";

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
    inputSchema: TaskCreateSchema.pick({
      question: true,
      userRequest: true,
    }),
    outputSchema: ResponseSchema,
    authPolicy: appAuthPolicy("enqueueTaskCreate"),
  },
  async (input) => {
    const {
      userRequest: { userID },
    } = input;
    const docRef = database.collection(`/users/${userID}/tasks`).doc();
    const taskID = docRef.id;
    const taskLoading: TaskPreparing = {
      status: "preparing",
      id: taskID,
      userID,
      question: input.question,
      serverCreatedDateTime: firestoreTimestampJSON(Timestamp.now()),
      serverUpdatedDateTime: firestoreTimestampJSON(Timestamp.now()),
    };
    database.doc(`/users/${userID}/tasks/${taskID}`).set(taskLoading);

    const queue = getFunctions().taskQueue("executeTaskCreate");
    const executeTaskCreateURL = await getFunctionURL("executeTaskCreate");
    queue.enqueue(Object.assign(input, { taskID }), {
      uri: executeTaskCreateURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response: z.infer<typeof ResponseSchema> = {
      result: "OK",
      statusCode: 200,
      data: {
        taskID,
      },
    };

    return response;
  }
);
