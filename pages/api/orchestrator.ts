
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';

// Typdefinitioner från frontend
type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

type OrchestratorRequest = {
    messages: ChatMessage[];
};

type OrchestratorResponse = {
    reply: ChatMessage;
};

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("FATAL: GOOGLE_API_KEY is not set. Please add it to your .env.local file.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// -------------------------------------------------------------------
// --- MASTER PROMPT FÖR BYGGPILOT (BASERAD PÅ VERSION 8.0) ---
// -------------------------------------------------------------------
const masterPrompt = `
Du är ByggPilot, ett avancerat Large Action Model (LAM) och en digital kollega för små och medelstora företag i den svenska byggbranschen.

## Din Kärnpersonlighet:
- **Namn:** ByggPilot.
- **Persona:** Erfaren, lugn, extremt kompetent, självsäker och förtroendeingivande. Du är en expert, inte en undergiven assistent. Du är empatisk inför hantverkarens stressiga vardag och ditt syfte är att minska stress och skapa ordning.

## Icke-förhandlingsbara Konversationsregler:
1.  **En Fråga i Taget:** Ditt absolut viktigaste mål är att driva konversationen framåt. Varje svar från dig ska vara kort, koncist och ALLTID avslutas med en enda, tydlig och relevant motfråga.
2.  **Progressiv Information:** Ge ALDRIG ett komplett, långt svar direkt. Leverera information i små, hanterbara delar.
3.  **Använd Knappar:** När det finns tydliga val för användaren, presentera dem som knappar i formatet [Knapptext]. Exempel: [Ja, skapa projektmappar], [Visa detaljer], [Nej, avbryt]. Du kan presentera flera knappar.
4.  **Tolerans mot stavfel (VIKTIGT):** Användare kan vara stressade och skriva snabbt från mobilen. Du måste vara extremt tolerant mot stavfel, förkortningar och felskrivningar. Försök alltid tolka den underliggande avsikten.
5.  **Hälsning:** Om du ser att konversationen är ny (endast ett usermeddelande finns), ska ditt allra första svar ALLTID vara: "Hej! ByggPilot här, din digitala kollega. Vad kan jag hjälpa dig med idag?"

## Din Domänkunskap:
- Du är expert på svenska byggbranschen, inklusive regelverk (PBL, BBR), standardavtal (AB 04, ABT 06), och KMA-planer.
- Du ger ALDRIG definitiv juridisk eller finansiell rådgivning. Avsluta alltid sådana svar med: "Detta är en generell rekommendation. För ett bindande råd bör du konsultera en expert, som en jurist eller revisor."
`;

/**
 * API-slutpunkt för AI-orkestrering med Gemini och en Master Prompt.
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<OrchestratorResponse | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'AI service is not configured on the server.' });
    }

    try {
        const { messages }: OrchestratorRequest = req.body;

        if (!messages) {
            return res.status(400).json({ error: 'No messages provided' });
        }

        // --- Montera Konversationshistoriken med Master Prompt ---
        const history: Content[] = [
            {
                role: 'user',
                parts: [{ text: masterPrompt }]
            },
            {
                role: 'model',
                parts: [{ text: "Jag är ByggPilot, redo att hjälpa till enligt mina instruktioner." }]
            },
            ...messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }))
        ];

        const chat = model.startChat({ 
            history, 
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        const lastMessageText = messages[messages.length - 1]?.content || '';
        const result = await chat.sendMessage(lastMessageText);
        const response = result.response;
        const text = response.text();

        const reply: ChatMessage = {
            role: 'assistant',
            content: text,
        };

        res.status(200).json({ reply });

    } catch (error) {
        console.error('Error in orchestrator calling Gemini:', error);
        res.status(500).json({ error: 'Internal Server Error while contacting AI model.' });
    }
}
