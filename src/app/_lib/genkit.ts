
import { genkit, configure } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase/plugin'; // GULDSTANDARD v5.1: Korrekt import-sökväg
import { googleAI } from '@genkit-ai/googleai/plugin'; // GULDSTANDARD v5.1: Korrekt import-sökväg
import { z } from 'zod';

/**
 * GULDSTANDARD v5.1: Centraliserad Genkit-initialisering.
 * Uppdaterad för att hantera de senaste ändringarna i Genkit-biblioteket.
 */
export function initGenkit() {
  if (genkit()?.plugins()?.some(p => p.name === 'google-ai')) {
    console.log("[Genkit] Redan initialiserad. Skippar omkonfigurering.");
    return;
  }

  console.log("[Genkit] Initialiserar Genkit för Guldstandard v5.1...");

  configure({
    plugins: [
      firebase(),
      googleAI(),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
  });
  
  console.log("[Genkit] Initialisering slutförd.");
}


export const Message = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export type Message = z.infer<typeof Message>;
