import express from "express";

const app = express();

import { genkit, z } from "genkit";
import { gemini15Flash, vertexAI } from "@genkit-ai/vertexai";
import { runFlow } from "@genkit-ai/flow";

const ai = genkit({
  plugins: [vertexAI({ location: "us-central1" })],
});

app.get("/", async (req, res) => {
  const result = await askForIngredientsFlow("肉じゃが");
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

export const askForIngredientsFlow = ai.defineFlow(
  {
    name: "askForIngredientsFlow",
    // フローにも型付けのInput/Outputを指定できる
    inputSchema: z.string(),
    outputSchema: FoodSchema,
  },
  async (food: string) => {
    // フロー内でLLMの実行やその他ワークフロー処理を行う
    const { output } = await ai.generate({
      model: gemini15Flash,
      prompt: `${food} の材料を日本語で教えて下さい.`,
      output: { schema: FoodSchema },
    });
    if (!output) {
      throw new Error("Failed to generate ingredients");
    }
    return output;
  }
);

(async () => {
  const result = await askForIngredientsFlow("肉じゃが");
  console.log(result);
})();
