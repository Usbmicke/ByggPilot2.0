import 'server-only'; // Kritiskt! Stoppar koden från att läcka till klienten
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

// Starta telemetri för debugging (valfritt men bra)
enableFirebaseTelemetry();

export const ai = genkit({
  plugins: [googleAI()],
});
