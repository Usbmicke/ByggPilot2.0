
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { defineFlow } from 'genkit/flow';
import { onCall } from 'firebase-functions/v2/https';
import * as z from 'zod';

// Konfigurera Genkit för att använda Firebase-pluginet
configureGenkit({
  plugins: [
    firebase(), // Initierar Firebase med standardinställningar
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Definiera vårt "menuSuggestion"-flöde
export const menuSuggestionFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string(), // Vi förväntar oss en sträng som input
    outputSchema: z.string(), // Vi kommer att returnera en sträng som output
  },
  async (name) => {
    // Detta är logiken för flödet
    return `Hello, ${name}! Hälsningar från en säker och stabil Genkit-backend.`;
  }
);

// Exponera flödet som en anropbar funktion för vår frontend
export const menuSuggestion = onCall({ region: 'europe-west1'}, async (request) => {
    // Kör flödet med data från anropet.
    // Notera: request.data är den rekommenderade metoden i v2 av functions.
    return await menuSuggestionFlow.run(request.data);
});

