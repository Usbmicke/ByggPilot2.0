import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleGenai } from '@genkit-ai/google-genai';

// Importera flödena för att säkerställa att de registreras med Genkit
import './flows/onboarding';
import './flows/getProjectsFlow';

// Exportera plugins för enkel återanvändning
export { genkit, firebase, googleGenai } from '@genkit-ai/core';

/**
 * Centraliserad funktion för att konfigurera Genkit.
 * Detta säkerställer att samma plugins och inställningar används överallt.
 */
export function configure(options?: any) {
  return configureGenkit({
    plugins: [
      firebase(), // Används för authPolicy i Next.js-integrationen
      googleGenai({ apiKey: process.env.GOOGLE_API_KEY }),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
    ...options, // Tillåter att anroparen åsidosätter eller lägger till konfiguration
  });
}

// Kör konfigurationen som standard
configure();
