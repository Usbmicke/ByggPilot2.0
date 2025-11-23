
import { genkit, configure } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

/**
 * GULDSTANDARD v5.0: Centraliserad Genkit-initialisering.
 * Denna funktion kapslar in hela konfigurationen för Genkit.
 * Den anropas EN GÅNG från Next.js-servern, vilket garanterar att
 * Genkit är redo att ta emot anrop från API-routes.
 */
export function initGenkit() {
  // Kontrollera om Genkit redan är konfigurerat för att undvika dubbel-initiering
  // i Next.js heta omladdningsmiljö.
  if (genkit()?.plugins()?.some(p => p.name === 'google-ai')) {
    console.log("[Genkit] Redan initialiserad. Skippar omkonfigurering.");
    return;
  }

  console.log("[Genkit] Initialiserar Genkit för Guldstandard v5.0...");

  configure({
    plugins: [
      firebase(), // Ansluter till Firebase (för auth, etc.)
      googleAI(), // Ansluter till Google AI-modeller som Gemini
    ],
    logLevel: 'debug', // Logga allt för felsökning
    enableTracingAndMetrics: true, // Viktigt för observation
  });
  
  console.log("[Genkit] Initialisering slutförd.");
}


/**
 * GULDSTANDARD v5.0: Central och agnostisk meddelandetyp.
 * Denna Zod-schema och TypeScript-typ definierar strukturen för ett chattmeddelande.
 * Den är placerad här för att kunna delas säkert mellan:
 *   1. Frontend-komponenter (t.ex. Chat.tsx)
 *   2. Backend Genkit-flöden (t.ex. brains.ts)
 * Detta förhindrar cirkulära beroenden och håller arkitekturen ren.
 */
export const Message = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

// Exportera även som en TypeScript-typ för enkel användning i komponenter.
export type Message = z.infer<typeof Message>;
