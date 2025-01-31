import { GenerateOptions, genkit, z } from "genkit";
import {
  genkitAI,
  googleGenerativeAI,
  googleSearchModel,
} from "../../utils/ai/ai";
import { SchemaType } from "@google/generative-ai";
import { ToolDefinition } from "genkit/model";
import zodToJsonSchema from "zod-to-json-schema";

const TODOCreateSchemaInput = z.object({
  question: z.string(),
});

const TODOCreateSchemaOutput = z.array(
  z.object({
    content: z.string(),
    url: z.string(),
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
    outputSchema: z.string(),
  },
  async (input) => {
    // const options: GenerateOptions = {
    //   prompt: `${input.question} を達成するために必要なTODOリストを教えてください`,
    //   output: { schema: TODOCreateSchemaOutput },
    // };
    // const response = await genkitAI.generate(options);

    const model = googleSearchModel();
    const schema = zodToJsonSchema(TODOCreateSchemaOutput);
    console.log(JSON.stringify({ schema: schema }, null, 2));
    const result = await model.generateContent(
      `${"結婚に必要なこと"} を達成するために必要なTODOリストを出力してください。JSON形式で出力してください。スキーマは ${TODOCreateSchemaOutput.toString()} です。`
    );
    return result.response?.text() ?? "";
  }
);
