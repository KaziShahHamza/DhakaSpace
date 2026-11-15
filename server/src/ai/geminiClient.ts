import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Returns an initialized GoogleGenAI client if GEMINI_API_KEY (or GOOGLE_API_KEY)
 * is configured with a non-placeholder value, otherwise null.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
