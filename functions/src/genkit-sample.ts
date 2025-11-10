// Import the Genkit core libraries and plugins.
import { genkit, z } from "genkit";
import { vertexAI } from "@genkit-ai/vertexai";
import { gemini20Flash } from "@genkit-ai/vertexai";

// Import the onFlow function from the Firebase plugin. This is the modern way to create an HTTP-triggered function.
import { onFlow } from "@genkit-ai/firebase/functions";

import { defineSecret } from "firebase-functions/params";
const apiKey = defineSecret("gemini_api_key");

import { enableFirebaseTelemetry } from "@genkit-ai/firebase";
enableFirebaseTelemetry();

const ai = genkit({
  plugins: [
    vertexAI({ location: "us-central1" }),
  ],
});

// Define and export the Firebase Function in one step using onFlow.
export const menuSuggestion = onFlow(
  {
    // Firebase-specific options
    httpsOptions: {
      // This is the crucial part that fixes the CORS error.
      // 'true' allows requests from any origin.
      cors: true,
    },
    secrets: [apiKey],

    // Genkit flow definition
    name: "menuSuggestionFlow", // This name is for observability, not the function trigger name.
    inputSchema: z.string().describe("A restaurant theme").default("seafood"),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (subject: string, { sendChunk }: { sendChunk: (chunk: string) => void; }) => {
    const prompt = `Suggest an item for the menu of a ${subject} themed restaurant`;
    const { response, stream } = ai.generateStream({
      model: gemini20Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    for await (const chunk of stream) {
      sendChunk(chunk.text);
    }

    return (await response).text;
  }
);
