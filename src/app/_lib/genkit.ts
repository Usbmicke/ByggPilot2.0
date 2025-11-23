
// GULDSTANDARD v14: DEN STORA UPPDATERINGEN
// Helt omskriven för att använda den moderna Genkit-arkitekturen baserat på användarens dokumentation.
// Detta använder `genkit()` och det nya, enade `@genkit-ai/google-genai`-pluginet.

import { genkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase'; 
// KORRIGERAD IMPORT: Använder det nya, enade google-genai-pluginet.
import { googleAI } from '@genkit-ai/google-genai'; 
import { z } from 'zod';

declare global {
  var __genkitInitialized: boolean | undefined;
}

// KORRIGERAD FUNKTION: Byt namn för tydlighet och för att undvika förvirring.
export function ensureGenkitInitialized() {
  if (global.__genkitInitialized) {
    return;
  }

  console.log("[Genkit] Initialiserar Genkit för Guldstandard v14.0...");

  // NY SYNTAX: Använder `genkit()`-anropet enligt den nya dokumentationen.
  genkit({
    plugins: [
      firebase(), // Notera: Vissa plugins kan behöva anropas som funktioner.
      googleAI(), // Anropar det nya googleAI-pluginet.
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
  });
  
  global.__genkitInitialized = true;
  console.log("[Genkit] Initialisering slutförd med den nya arkitekturen.");
}


export const Message = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export type Message = z.infer<typeof Message>;
