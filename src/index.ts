import { z } from "zod";
import { genkitAI, googleSearchGroundingData } from "./utils/ai/ai";
import { authMiddleware } from "./middleware/authMiddleware";


export const taskCreate = require("./flows/taskCreate/flow");

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

if (process.env.APP_ENV !== "local") {
  genkitAI.startFlowServer({ flows: [taskCreate] });
}
