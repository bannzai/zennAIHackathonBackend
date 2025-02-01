import { z } from "zod";
import { genkitAI, googleSearchGroundingData } from "./utils/ai/ai";

export const taskCreate = require("./flows/taskCreate/flow");

export const test = genkitAI.defineFlow(
  {
    name: "askForIngredientsFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
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

genkitAI.startFlowServer({ flows: [taskCreate] });
