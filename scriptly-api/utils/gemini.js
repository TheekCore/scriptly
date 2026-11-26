import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { buildNotePrompt } from "../prompts.js";
import { validateNoteJsonShape } from "./validator.js";
import { withRetry } from "./retry.js";

dotenv.config();

/**
 * Calls Google Gemini using the official @google/genai SDK to structure notes.
 * Automatically retries with backoff and falls back to alternate flash models
 * if Google servers experience temporary high-demand (503) spikes.
 * 
 * @param {{ files: Array, subject: string, text: string }} params
 * @returns {Promise<object>} Structured note JSON
 */
export async function structureNoteWithGemini({ files = [], subject, text }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  if (!configuredModel) {
    throw new Error("GEMINI_MODEL environment variable is not set");
  }

  // Initialize official Gemini SDK client
  const ai = new GoogleGenAI({ apiKey });

  // 1. Convert multer image buffers to Gemini inlineData parts
  const imageParts = (files || []).map((file) => ({
    inlineData: {
      mimeType: file.mimetype,
      data: file.buffer.toString("base64"),
    },
  }));

  // 2. Build the system/user prompt
  const promptText = buildNotePrompt(subject, text);
  const contents = [...imageParts, { text: promptText }];

  // Candidate models: configured model first, followed by reliable flash models
  const candidateModels = Array.from(
    new Set([configuredModel, "gemini-3.5-flash-lite", "gemini-3.5-flash"])
  );

  let lastError;

  for (const modelName of candidateModels) {
    try {
      return await withRetry(async (attempt) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2, // Low temperature for high factual accuracy
          },
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error("Empty response received from Gemini model");
        }

        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch (parseErr) {
          throw new Error(`Failed to parse AI response as JSON: ${parseErr.message}`);
        }

        // Validate output shape
        if (!validateNoteJsonShape(parsed)) {
          throw new Error("Gemini returned JSON with missing or invalid fields");
        }

        return parsed;
      }, [1500, 3000]);
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Pipeline] Model ${modelName} failed (${err.status || err.message}). Attempting next candidate...`);
    }
  }

  throw lastError;
}
