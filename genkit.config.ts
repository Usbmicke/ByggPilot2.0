import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';

// Importera flödena så att Genkit-servern känner till dem.
// Detta är ett kritiskt steg.
import * as flows from './src/lib/genkit/flows';

configureGenkit({
  plugins: [
    // Firebase-plugin för autentisering och server-side logik.
    firebase(), 
    // Google AI-plugin för att interagera med Gemini-modeller.
    googleAI(),
  ],
  // Definiera vilka flöden som ska vara tillgängliga via API.
  // Här exponerar vi alla flöden som importerats från flows.ts.
  flows: Object.values(flows),

  // Konfigurera hur servern ska köras.
  flowStateStore: 'firebase',
  traceStore: 'firebase',
  logLevel: 'debug', // Sätt till 'info' i produktion
  enableTracingAndMetrics: true, // Aktivera för spårning i Firebase Console
});
