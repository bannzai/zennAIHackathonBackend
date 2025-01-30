import { genkit, z } from "genkit";
import { gemini15Flash, vertexAI } from "@genkit-ai/vertexai";
import {
  DynamicRetrievalMode,
  GoogleGenerativeAI,
} from "@google/generative-ai";

export const ai = genkit({
  plugins: [vertexAI({ location: "us-central1" })],
});

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);
