import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
export const hasGemini = Boolean(apiKey);

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiModel(model = "gemini-2.0-flash") {
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is missing");
  }
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model });
}
