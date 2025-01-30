import { genkit, z } from "genkit";
import { genkitAI, googleGenerativeAI } from "../../utils/ai/ai";
import { SchemaType } from "@google/generative-ai";

const TODOCreateSchemaInput = z.object({
  question: z.string(),
});

const TODOCreateSchemaOutput = z.object({
  id: z.string(),
  content: z.string(),
});

export type TODOCreateOutput = (typeof TODOCreateSchemaOutput)["_output"] & {};

export const todoCreateFlow = genkitAI.defineFlow(
  {
    name: "askForIngredientsFlow",
    inputSchema: TODOCreateSchemaInput,
    outputSchema: TODOCreateSchemaOutput,
  },
  async (input: TODOCreateSchemaInput) => {
    const ai = googleGenerativeAI;
    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      tools: [
        {
          functionDeclarations: [
            {
              name: "createTodo",
              description: "Create a todo item",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
              },
            },
          ],
        },
      ],
    });
    const result = await model.generateContent(input.question);
    const output = result.response?.text();
    return { id: "1", content: output };
  }
);
