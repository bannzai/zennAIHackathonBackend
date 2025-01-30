import express from "express";

const app = express();

import { genkit, z } from "genkit";
import { gemini15Flash, vertexAI } from "@genkit-ai/vertexai";
import {
  DynamicRetrievalMode,
  GoogleGenerativeAI,
} from "@google/generative-ai";

const ai = genkit({
  plugins: [vertexAI({ location: "us-central1" })],
});
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

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
    outputSchema: z.string(),
  },
  async (food: string) => {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools: [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: DynamicRetrievalMode.MODE_UNSPECIFIED,
              dynamicThreshold: 0.5,
            },
          },
        },
      ],
    });
    // フロー内でLLMの実行やその他ワークフロー処理を行う

    const result = await model.generateContent(
      `${food} の材料を日本語で教えて下さい.`
    );
    const output = result.response?.text();
    const metadata =
      result.response?.candidates?.[0]?.groundingMetadata
        ?.groundingChuncks?.[0];
    console.log(metadata);

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
