import { genkit, z } from "genkit";
import { ai } from "../../utils/ai/ai";

export const askForIngredientsFlow = ai.defineFlow(
  {
    name: "askForIngredientsFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (question: string) => {
    return question;
  }
);
