import { genkit, z } from "genkit";
import { vertexAI } from "@genkit-ai/vertexai";
import { gemini15Pro, gemini20FlashExp } from "@genkit-ai/vertexai";
import {
  GenerateContentCandidate,
  GenerativeModel,
  GoogleGenerativeAI,
  GroundingChunk,
  SchemaType,
  Tool,
} from "@google/generative-ai";
import { GroundingData } from "../../entity/grouping_url";

export const genkitAI = genkit({
  model: gemini15Pro.withConfig({ googleSearchRetrieval: {} }),
  // NOT WORKING: genkitはgoogleSearchが使えない
  // model: gemini20FlashExp.withConfig({ googleSearch: {} } as any),
  plugins: [vertexAI()],
});

export const googleGenerativeAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

// Unable to submit request because Please use google_search field instead of google_search_retrieval field.. Learn more: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini
// gemini-2.0-flash-exp では google_search_retrieval が使えない googleSearch を無理やり渡せば使える
// なお、今の所コスト面以外では gemini-1.5-flashにして googleSearchRetrival を使っても問題はない
// https://stackoverflow.com/questions/79289711/grounding-with-google-search-with-gemini-2-0-flash-exp
export const googleSearchTool = {
  googleSearch: {},
} as Tool;

export function googleSearchModel(): GenerativeModel {
  // const model = googleGenerativeAI.getGenerativeModel({
  //   model: "gemini-1.5-flash",
  //   tools: [
  //     {
  //       googleSearchRetrieval: {},
  //     },
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
    model: "gemini-2.0-flash-exp",
    tools: [
      googleSearchTool,
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

export async function googleSearchGroundingData(
  query: string
): Promise<{ aiTextResponse: string; groundings: GroundingData[] }> {
  // NOTE: この方法だと、candidatesが返ってこない時がある。generateContentにもgoogleSearchToolを渡してあげる必要がある
  // const result = await model.generateContent(
  //   query
  // );
  const model = googleSearchModel();
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: query }] }],
    tools: [googleSearchTool],
  });
  const response = result.response;
  const candidates = response?.candidates;
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
  return { aiTextResponse: response?.text() ?? "", groundings };
}
