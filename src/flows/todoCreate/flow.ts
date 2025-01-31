import { GenerateOptions, genkit, z } from "genkit";
import { genkitAI, googleGenerativeAI } from "../../utils/ai/ai";
import { SchemaType } from "@google/generative-ai";
import { ToolDefinition } from "genkit/model";

const TODOCreateSchemaInput = z.object({
  question: z.string(),
});

const TODOCreateSchemaOutput = z.array(
  z.object({
    content: z.string(),
  })
);

export type TODOCreateOutput = (typeof TODOCreateSchemaOutput)["_output"] & {};

export const todoCreateTool = genkitAI.defineTool(
  {
    name: "createTodo",
    description: "Create a todo item",
    inputSchema: TODOCreateSchemaInput,
    outputSchema: z.string(),
  },
  async (input) => {
    return `${input.question} を達成するために必要なTODOリストを教えてください`;
  }
);
export const todoCreateFlow = genkitAI.defineFlow(
  {
    name: "todoCreateFlow",
    inputSchema: TODOCreateSchemaInput,
    outputSchema: TODOCreateSchemaOutput,
  },
  async (input) => {
    const options: GenerateOptions = {
      prompt: `${input.question} を達成するために必要なTODOリストを教えてください`,
      output: { schema: TODOCreateSchemaOutput },
    };
    const response = await genkitAI.generate(options);
    return response.output;
  }
);
