import { z } from "genkit";
import { genkitAI } from "./ai/ai";
import { GroundingData, GroundingDataSchema } from "../entity/grounding";
import { LocationSchema } from "../entity/location";
import { GroundingChunk } from "@google/generative-ai";

export const queryLocation = genkitAI.defineFlow(
  {
    name: "queryLocation",
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.object({
      aiTextResponse: z.string(),
      groundings: z.array(GroundingDataSchema),
      locations: z.array(LocationSchema),
    }),
  },
  async (input) => {
    console.log(`#queryLocation: ${JSON.stringify({ input }, null, 2)}`);
    if (process.env.APP_ENV !== "local") {
      return {
        aiTextResponse: "localのみ実行できます",
        groundings: [],
        locations: [],
      };
    }
    const response = await genkitAI.generate({
      prompt: input.query,
    });
    const responseCustom = response.custom as any;
    const candidates = responseCustom.candidates;
    const groundings: GroundingData[] = [];
    if (candidates) {
      for (const candidate of candidates) {
        const groudingMetadata = candidate?.groundingMetadata;
        const index = candidate?.index;
        const anyGroudingMetadata = groudingMetadata as any;
        // typo: https://github.com/google-gemini/generative-ai-js/issues/323
        const groundingChunks = anyGroudingMetadata[
          "groundingChunks"
        ] as GroundingChunk[];
        const web = groundingChunks?.[0].web;
        const title = web?.title;
        const url = web?.uri;
        groundings.push({ title, url, index });
      }
    }

    const jsonResponse = await genkitAI.generate({
      prompt: input.query,
      output: {
        schema: z.array(LocationSchema),
      },
    });

    const locations = jsonResponse.output ?? [];

    return {
      aiTextResponse: response.text ?? "",
      groundings,
      locations,
    };
  }
);
