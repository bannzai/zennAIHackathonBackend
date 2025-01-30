import { genkit, z } from "genkit";
import { gemini15Flash, vertexAI } from "@genkit-ai/vertexai";
import {
  DynamicRetrievalMode,
  GoogleGenerativeAI,
} from "@google/generative-ai";

export const genkitAI = genkit({
  plugins: [vertexAI({ location: "us-central1" })],
});

export const googleGenerativeAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENAI_API_KEY!
);
