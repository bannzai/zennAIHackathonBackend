import { z } from "zod";
import { genkitAI, googleSearchGroundingData } from "./utils/ai/ai";
import { authMiddleware } from "./middleware/authMiddleware";

export const taskCreate = require("./functions/taskCreate/flow").taskCreate;
export const enqueueTaskCreate =
  require("./functions/taskCreate/enqueue_task").enqueueTaskCreate;
export const executeTaskCreate =
  require("./functions/taskCreate/execute_task").executeTaskCreate;

export const test = genkitAI.defineFlow(
  {
    name: "askForIngredientsFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
    middleware: [authMiddleware],
  },
  async (question: string) => {
    const { aiTextResponse, groundings } = await googleSearchGroundingData(
      question
    );

    if (!aiTextResponse) {
      throw new Error("Failed to generate ingredients");
    }
    return aiTextResponse;
  }
);

// NOTE: default port number is 3400
genkitAI.startFlowServer({
  flows: [taskCreate, enqueueTaskCreate],
});
