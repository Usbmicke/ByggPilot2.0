
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getToken } from 'next-auth/jwt';

// =================================================================================
// GULD STANDARD - API ROUTE (Server-sida)
// Version 10.0 - Uppgraderad till en långsiktigt hållbar modell.
// Bytt ut 'gemini-1.5-flash-latest' mot aliaset 'gemini-2.0-flash-lite'
// enligt den senaste dokumentationen för att säkerställa framtida stabilitet.
// =================================================================================

const apiKey = process.env.GEMINI_API_KEY;
// KORRIGERING: Använder det rekommenderade aliaset för en långsiktigt hållbar modell.
const MODEL_ID = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash-lite';

if (!apiKey) {
  throw new Error('GEMINI_API_KEY är inte satt i dina miljövariabler.');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: MODEL_ID });

const MASTER_PROMPT_V11 = `
DU ÄR BYGGPILOT 2.0 - EN VÄRLDSKLASSIG AI-EXPERT INOM BYGG- & FASTIGHETSBRANSCHEN.

DIN MISSION:
Att agera som en extremt kompetent, proaktiv och assisterande co-pilot för användare som arbetar med bygg- och fastighetsprojekt. Du ska hjälpa dem att spara tid, undvika fel och fatta bättre beslut.

DINA KÄRNKOMPETENSER:
- Kontraktsanalys (AMA, AB, ABT, etc.)
- Regulatorisk expertis (BBR, PBL, etc.)
- Kalkylering och kostnadsuppskattning
- Projektledning och tidsplanering
- Teknisk expertis inom byggmaterial och metoder
- Hållbarhet och miljöcertifieringar

DINA INSTRUKTIONER:
1.  **Var Proaktiv, Inte Reaktiv:** Nöj dig inte med att svara på frågan. Identifiera det bakomliggande behovet. Föreslå nästa steg. Om en användare laddar upp ett kontrakt, fråga om du ska granska det för vanliga fallgropar. Om de nämner ett material, informera om alternativ och kostnader.
2.  **Använd Branschterminologi Korrekt:** Du talar språket flytande. Använd termer som "entreprenad", "beställare", "projektering", "slutbesiktning" på ett naturligt sätt.
3.  **Fokusera på Svenska Regler:** All rådgivning måste vara förankrad i svensk lagstiftning och praxis (Boverkets Byggregler, Plan- och bygglagen, AMA-systemet).
4.  **Strukturera Dina Svar:** Använd Markdown för att skapa tydliga, läsbara svar. Använd rubriker, listor och fetstil för att lyfta fram viktig information.
5.  **Var Koncis Men Komplett:** Ge direkta och användbara svar. Undvik onödigt prat.
6.  **Ställ Alltid Följdfrågor:** Avsluta varje svar med en eller två relevanta följdfrågor för att driva konversationen framåt och hjälpa användaren vidare. Exempel: \"Ska jag skapa en enkel tidsplan för detta?", \"Vill du att jag jämför detta med en annan lösning?\".
`;

interface RequestMessage {
    role: 'user' | 'model'; // Notera: 'model' istället för 'assistant'
    parts: { text: string }[];
}

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Authentication required' }), { status: 401 });
        }

        const { messages: rawMessages } = await req.json();
        if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
            return new NextResponse(JSON.stringify({ error: 'Invalid input: messages must be a non-empty array' }), { status: 400 });
        }

        // Korrigerar rollen från 'assistant' till 'model' för API:et
        const history = (rawMessages.slice(0, -1)).map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: msg.parts.map((p: any) => ({ text: p.text }))
        }));
        const userMessageContent = rawMessages[rawMessages.length - 1].parts[0].text;

        const chat = model.startChat({
            history: history,
            generationConfig: {
                // ... (kan lägga till maxOutputTokens etc. här)
            },
            // systemInstruction stöds inte direkt i denna version på samma sätt, vi lägger det i kontexten.
        });

        const result = await chat.sendMessageStream(MASTER_PROMPT_V11 + "\n\n" + userMessageContent);

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            controller.enqueue(new TextEncoder().encode(chunkText));
                        }
                    }
                } catch (streamError) {
                    console.error('[Google Generative AI Stream Error]', streamError);
                    const errorJson = JSON.stringify({ error: 'Error processing AI response stream.' });
                    controller.enqueue(new TextEncoder().encode(errorJson));
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error) {
        console.error('[Google Generative AI API Error]', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}
