
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { defineFlow, startFlowsServer } from '@genkit-ai/flow';
import { geminiPro } from '@genkit-ai/googleai';
import * as z from 'zod';

// Konfigurera Genkit att använda Firebase för state management och Google AI för modeller
configureGenkit({
  plugins: [
    firebase(),       // För integration med Firebase (autentisering, loggning)
    geminiPro(),      // För att använda Gemini Pro-modellen
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

/**
 * Ett enkelt "Hello World"-flöde för att verifiera Genkit-installationen.
 * Tar ett namn som input och returnerar en personlig hälsning.
 */
export const helloWorldFlow = defineFlow(
  {
    name: 'helloWorldFlow',
    inputSchema: z.object({ name: z.string() }),
    outputSchema: z.object({ greeting: z.string() }),
  },
  async (input) => {
    const { name } = input;
    const greeting = `Hej, ${name}! Välkommen till Genkit.`;
    
    console.log('helloWorldFlow kördes med input:', input);

    return { greeting };
  }
);

// Starta flödesservern (om filen körs direkt)
// I en Firebase Functions-miljö hanteras detta annorlunda
if (require.main === module) {
  startFlowsServer();
}
