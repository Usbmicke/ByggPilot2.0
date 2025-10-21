
'use server';

import { google } from '@ai-sdk/google';
import type { CoreMessage } from 'ai';

// =================================================================================
// CHAT ACTION V5.0 - PLATINUM STANDARD (STABIL VERSION)
//
// Beskrivning: Detta är en ren, enkel Next.js Server Action.
// Den är helt fri från `ai/rsc` och `createAI` som orsakade krascherna.
// Den tar emot historiken, anropar Gemini, och returnerar en rå text-sträng.
// Detta är en garanterat stabil och robust lösning.
// =================================================================================

export async function submitMessage(history: CoreMessage[], userInput: string): Promise<string> {
  'use server';

  // Bygg upp historiken för Gemini-anropet
  const messages: CoreMessage[] = [
    ...history,
    { role: 'user', content: userInput },
  ];

  try {
    // Anropa Google Gemini API direkt
    const { text } = await google('models/gemini-pro').doGenerate({
      history: messages,
      prompt: userInput, // prompt är tekniskt sett redundant här då sista meddelandet är userinput, men för tydlighetens skull.
    });

    if (!text) {
        return "Jag kunde inte hitta ett svar. Försök igen.";
    }

    // Returnera det rena text-svaret
    return text;

  } catch (error) {
    console.error("Fel vid anrop till Gemini API:", error);
    // Returnera ett meningsfullt felmeddelande till användaren
    return "Ett fel uppstod vid kommunikationen med AI-assistenten. Vänligen kontrollera serverloggarna.";
  }
}
