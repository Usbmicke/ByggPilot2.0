
// ===================================================================
// GULDSTANDARD v15.0 - GENKIT CORE CONFIGURATION
// ByggPilot 2.0 - Senior Fullstack Architect
// Datum: 23 November 2025
// ===================================================================
//
// Denna fil definierar kärnkonfigurationen för vår separata Genkit-server.
// Den följer den nya, enhetliga arkitekturen för att stödja Gemini 3.
//

import { genkit } from 'genkit';
import { firebase } from '@genkit-ai/firebase';
import { vertexAI, googleAI } from '@genkit-ai/google-genai';

// Exportera den konfigurerade ai-instansen för användning i våra flöden.
export const ai = genkit({
  plugins: [
    // Firebase-plugin för integration med Firebase-ekosystemet (t.ex. för autentisering/triggers).
    firebase(),
    
    // Vertex AI-plugin för produktion. Använder Application Default Credentials.
    // Vi specificerar vår region för att säkerställa datasuveränitet och prestanda.
    vertexAI({ location: 'europe-north1' }),

    // Google AI-plugin (Gemini Developer API) för lokal utveckling.
    // Kan aktiveras vid behov. Kräver att GEMINI_API_KEY finns i .env.
    // googleAI(),
  ],
  // Loggnivå för felsökning under utveckling. Kan sättas till 'info' i produktion.
  logLevel: 'debug',
  // Aktiverar spårning och mätvärden för observerbarhet i Google Cloud Operations.
  enableTracingAndMetrics: true,
});

// Denna export är inte strikt nödvändig för flöden, men kan vara
// användbar om andra delar av Genkit-servern behöver tillgång till 
// de konfigurerade modellerna direkt.
export { geminiPro, gemini15Pro } from 'genkit/models';
