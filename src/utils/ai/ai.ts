import { genkit, z } from "genkit";
import { vertexAI } from "@genkit-ai/vertexai";
import { gemini15Pro, gemini20FlashExp } from "@genkit-ai/vertexai";
import {
  GenerativeModel,
  GoogleGenerativeAI,
  SchemaType,
  Tool,
} from "@google/generative-ai";

export const genkitAI = genkit({
  model: gemini15Pro.withConfig({ googleSearchRetrieval: {} }),
  // model: gemini20FlashExp.withConfig({ googleSearch: {} } as any),
  plugins: [vertexAI()],
});

export const googleGenerativeAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export function googleSearchModel(): GenerativeModel {
  // Unable to submit request because Please use google_search field instead of google_search_retrieval field.. Learn more: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini
  // gemini-2.0-flash-exp では google_search_retrieval が使えない googleSearch を無理やり渡せば使える
  // なお、今の所コスト面以外では gemini-1.5-flashにして googleSearchRetrival を使っても問題はない
  // https://stackoverflow.com/questions/79289711/grounding-with-google-search-with-gemini-2-0-flash-exp
  const googleSearchTool = {
    googleSearch: {},
  } as Tool;
  const functionTool: Tool = {
    functionDeclarations: [
      {
        name: "createTodo",
        description: "Create a todo item",
        parameters: {
          type: SchemaType.OBJECT,
          required: ["todos"],
          properties: {
            todos: {
              type: SchemaType.ARRAY,
              nullable: false,
              items: {
                type: SchemaType.OBJECT,
                nullable: false,
                properties: {
                  content: {
                    type: SchemaType.STRING,
                    nullable: false,
                  },
                  url: {
                    type: SchemaType.STRING,
                    nullable: false,
                    description: "grounding url",
                  },
                },
              },
            },
          },
        },
      },
    ],
  };

  // const model = googleGenerativeAI.getGenerativeModel({
  //   model: "gemini-2.0-flash-exp",
  //   tools: [
  //     googleSearchTool,
  //     // functionTool,
  //     // {
  //     //   googleSearchRetrieval: {
  //     //     dynamicRetrievalConfig: {
  //     //       // mode: DynamicRetrievalMode.MODE_DYNAMIC,
  //     //       // dynamicThreshold: 0.5,
  //     //     },
  //     //   },
  //     // },
  //   ],
  const model = googleGenerativeAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: [
      {
        googleSearchRetrieval: {},
      },
      // functionTool,
      // {
      //   googleSearchRetrieval: {
      //     dynamicRetrievalConfig: {
      //       // mode: DynamicRetrievalMode.MODE_DYNAMIC,
      //       // dynamicThreshold: 0.5,
      //     },
      //   },
      // },
    ],
  });

  return model;
}
