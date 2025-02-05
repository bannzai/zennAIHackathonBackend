/* eslint-disable @typescript-eslint/no-var-requires */

import { initializeApp } from "firebase-admin/app";

initializeApp();

import { z } from "zod";
import { genkitAI, googleSearchGroundingData } from "./utils/ai/ai";
import { appAuthPolicy } from "./utils/ai/authPolicy";
import { onFlow } from "@genkit-ai/firebase/functions";

export const taskCreate = require("./functions/taskCreate/flow").taskCreate;
export const enqueueTaskCreate =
  require("./functions/taskCreate/enqueue_task").enqueueTaskCreate;
export const executeTaskCreate =
  require("./functions/taskCreate/execute_task").executeTaskCreate;

export const test = onFlow(
  genkitAI,
  {
    name: "askForIngredientsFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
    authPolicy: appAuthPolicy("askForIngredientsFlow"),
  },
  async (question: string) => {
    const { aiTextResponse } = await googleSearchGroundingData(question);

    if (!aiTextResponse) {
      throw new Error("Failed to generate ingredients");
    }
    return aiTextResponse;
  }
);
