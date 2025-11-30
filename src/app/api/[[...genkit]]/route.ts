
// src/app/api/[[...genkit]]/route.ts
import genkitConfig from '../../../genkit/genkit';
import genkit from '@genkit-ai/next';

// Exportera POST-hanteraren för att ansluta till Genkit
export const POST = genkit(genkitConfig);
