
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { defineFlow } from '@genkit-ai/flow';
import { onCallGenkit } from '@genkit-ai/firebase/functions';
import * as z from 'zod';

// Konfigurera Genkit för att använda Firebase-pluginet
configureGenkit({
  plugins: [
    firebase(), // Initierar Firebase med standardinställningar
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Definiera vårt "helloWorld"-flöde
export const helloWorldFlow = defineFlow(
  {
    name: 'helloWorldFlow',
    inputSchema: z.string(), // Vi förväntar oss en sträng som input
    outputSchema: z.string(), // Vi kommer att returnera en sträng som output
  },
  async (name) => {
    // Detta är logiken för flödet
    return `Hello, ${name}! Hälsningar från en säker och stabil Genkit-backend.`;
  }
);

// Exponera flödet som en anropbar funktion för vår frontend
export const helloWorld = onCallGenkit(
    {
        name: 'helloWorld', // Namnet vi anropar från frontend
        flow: helloWorldFlow, // Flödet som ska köras
        // Autentisering hanteras automatiskt av onCallGenkit
    }
)
