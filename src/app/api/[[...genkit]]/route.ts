
// src/app/api/[[...genkit]]/route.ts
import { genkit } from '../../../genkit/genkit';

// Exportera POST-hanteraren för att ansluta till Genkit
export const POST = genkit;
