'use server';

import { createAI, createStreamableValue, getMutableAIState } from 'ai/rsc';
import { createGoogleGenerativeAI } from '@ai-sdk/google'; 
import { ReactNode } from 'react';
import { z } from 'zod';
import AtaForm from '@/components/forms/AtaForm';
import { env } from '@/config/env';

// =================================================================================
// AI ACTION V2.0 - GULDSTANDARD (GOOGLE GEMINI)
// BESKRIVNING: Denna version är helt omskriven för att använda Google Gemini
// istället för OpenAI. Vi importerar `createGoogle` och instansierar en klient
// med den korrekta API-nyckeln från `.env.local`. Modellen är ändrad till en
// passande Gemini-modell. Detta följer Guldstandarden för en ren Google-arkitektur.
// =================================================================================

// Instansiera Google Genetive AI-klienten
const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY, 
});

// Definiera schemat för en ÄTA med Zod för validering
const ataSchema = z.object({
  projectName: z.string().describe('Namnet på projektet som ÄTA:n tillhör.'),
  description: z.string().describe('En kort beskrivning av ändringen, tillägget eller avgåendet.'),
  value: z.number().describe('Kostnaden eller värdet av ÄTA:n.'),
});

// Huvudfunktionen som anropas från klienten
async function submit(input: string): Promise<any> {
  'use server';
  const aiState = getMutableAIState<typeof AI>();
  const streamable = createStreamableValue();

  // Uppdatera AI-tillståndet med användarens meddelande
  aiState.update([
    ...aiState.get(),
    { role: 'user', content: input },
  ]);

  // Anropa Google Gemini för att generera ett objekt baserat på användarens input och de verktyg vi har
  const { tool, ...rest } = await google.generateObject({
    model: 'models/gemini-1.5-pro-latest', // Korrekt modell för Google Gemini
    prompt: input,
    schema: z.object({
        tool: z.enum(['createAta', 'createClient', 'createProject', 'startQuoteEngine']),
    }),
  });

  // Använd en switch för att anropa rätt verktyg
  switch (tool) {
    case 'createAta': {
        streamable.done(<AtaForm />);
        aiState.done([
            ...aiState.get(),
            { role: 'assistant', name: 'createAta', content: 'OK, här är ett formulär för att skapa en ny ÄTA.' },
        ]);
      break;
    }
    default: {
      streamable.done('Jag förstår inte det kommandot än.');
       aiState.done([
            ...aiState.get(),
            { role: 'assistant', content: 'Jag förstår inte det kommandot än.' },
        ]);
    }
  }

  return streamable.value;
}

// Definiera det initiala AI-tillståndet och actions
const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  role: 'user' | 'assistant';
  display: ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submit,
  },
  initialUIState,
  initialAIState,
});
