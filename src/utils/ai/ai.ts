import { genkit, z } from "genkit";
import { vertexAI } from "@genkit-ai/vertexai";
import {
  GenerativeModel,
  GoogleGenerativeAI,
  Tool,
} from "@google/generative-ai";

export const genkitAI = genkit({
  plugins: [vertexAI({ location: "us-central1" })],
});

export const googleGenerativeAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENAI_API_KEY!
);

export function googleSearchModel(): GenerativeModel {
  // Unable to submit request because Please use google_search field instead of google_search_retrieval field.. Learn more: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini
  // gemini-2.0-flash-exp では google_search_retrieval が使えない googleSearch を無理やり渡せば使える
  // なお、今の所コスト面以外では gemini-1.5-flashにして googleSearchRetrival を使っても問題はない
  // https://stackoverflow.com/questions/79289711/grounding-with-google-search-with-gemini-2-0-flash-exp
  const tool = {
    googleSearch: {},
  } as Tool;

  const model = googleGenerativeAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    tools: [
      tool,
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
