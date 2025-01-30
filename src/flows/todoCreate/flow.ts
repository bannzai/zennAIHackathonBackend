import { genkit, z } from "genkit";
import { genkitAI } from "../../utils/ai/ai";

export const askForIngredientsFlow = genkitAI.defineFlow(
  {
    name: "askForIngredientsFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (question: string) => {
    return question;
  }
);
