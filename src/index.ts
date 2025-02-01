import express from "express";

const app = express();

import { z } from "genkit";
import { genkitAI, googleSearchGroundingData } from "./utils/ai/ai";

app.get("/", async (req, res) => {
  const result = await askForIngredientsFlow("結婚に必要なこと");
  res.send(result);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`codelab-genai: listening on port ${port}`);
});

const FoodSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string()),
  description: z.string(),
});

export const askForIngredientsFlow = genkitAI.defineFlow(
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

export const taskCreate = require("./flows/taskCreate/flow");

// TODO: フローを起動する
// genkitAI.startFlowServer({ flows: [askForIngredientsFlow] });
