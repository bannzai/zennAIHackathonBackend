import express from "express";

const app = express();

import { z } from "genkit";
import { genkitAI, googleGenerativeAI, googleSearchModel } from "./utils/ai/ai";
import { Tool } from "@google/generative-ai";
import { todoCreateFlow } from "./flows/todoCreate/flow";

app.get("/", async (req, res) => {
  const result = await todoCreateFlow({ question: "結婚に必要なこと" });
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
    const model = googleSearchModel();
    const result = await model.generateContent(question);
    const output = result.response?.text();

    console.log("grouding---");
    const response = result.response;
    const candidates = response?.candidates;
    const firstCandidate = candidates?.[0];
    const groudingMetadata = firstCandidate?.groundingMetadata;
    const anyGroudingMetadata = groudingMetadata as any;
    // typo: https://github.com/google-gemini/generative-ai-js/issues/323
    const groundingChunks = anyGroudingMetadata["groundingChunks"];
    const web = groundingChunks?.[0].web;
    const title = web?.title;
    const url = web?.uri;
    // console.log(JSON.stringify({ response: response }, null, 2));
    // console.log(JSON.stringify({ candidates: candidates }, null, 2));
    // console.log(
    //   JSON.stringify({ groudingMetadata: groudingMetadata }, null, 2)
    // );
    // console.log(
    //   JSON.stringify({
    //     groundingChunksIsNull: groundingChunks === null,
    //     groudingChunksIsUndefined: groundingChunks === undefined,
    //     groundingChunksIsArray: Array.isArray(groundingChunks),
    //   })
    // );
    console.log(JSON.stringify({ groundingChunks: groundingChunks }));
    console.log(JSON.stringify({ web: web }, null, 2));
    console.log(JSON.stringify({ title: title }, null, 2));
    console.log(JSON.stringify({ url: url }, null, 2));

    // const { output } = await ai.generate({
    //   model: gemini15Flash,
    //   prompt: `${food} の材料を日本語で教えて下さい.`,
    //   output: { schema: FoodSchema },
    // });
    if (!output) {
      throw new Error("Failed to generate ingredients");
    }
    return output;
  }
);

export const todoCreate = require("./flows/todoCreate/flow");

// TODO: フローを起動する
// genkitAI.startFlowServer({ flows: [askForIngredientsFlow] });
