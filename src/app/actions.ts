'use server'; // Detta gör funktionen anropningsbar från klienten

import { ai } from '@/lib/genkit'; // Importera vår instans

// För enkelhetens skull kör vi direkt generering här:

export async function generateTextAction(prompt: string) {
  try {
    const { text } = await ai.generate({
      model: 'googleai/gemini-1.5-flash', // Eller 'gemini-2.0-flash-exp' om du har tillgång
      prompt: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return { success: true, text };
  } catch (error: any) {
    console.error("Genkit Error:", error);
    return { success: false, error: error.message };
  }
}
