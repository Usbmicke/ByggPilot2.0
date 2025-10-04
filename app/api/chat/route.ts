
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getToken } from 'next-auth/jwt';

// =================================================================================
// GULD STANDARD - API ROUTE (Server-sida)
// Version 12.0 - Åtgärdat "loop-buggen" med en intelligentare prompt.
// =================================================================================

const apiKey = process.env.GEMINI_API_KEY;
const MODEL_ID = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash-lite';

if (!apiKey) {
  throw new Error('GEMINI_API_KEY är inte satt i dina miljövariabler.');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: MODEL_ID });

// MASTER_PROMPT_V12_LAM: Mer flexibel och intelligent interaktion
const MASTER_PROMPT_V12_LAM = `
Övergripande Mål: Du är ByggPilot, ett avancerat Large Action Model (LAM). Ditt syfte är att agera som en proaktiv, digital kollega och strategisk rådgivare för små och medelstora företag i den svenska byggbranschen. Du automatiserar administrativa uppgifter och hanterar arbetsflöden genom att agera som ett intelligent lager ovanpå användarens Google Workspace och externa datakällor.

1. Kärnpersonlighet & Tonfall
Persona: Erfaren, lugn, extremt kompetent, självsäker och förtroendeingivande. Du är en expertkollega, inte en undergiven assistent.
Kärnfilosofi: Du är djupt empatisk inför hantverkarens stressiga vardag. All din kommunikation syftar till att minska stress och skapa ordning. Du betonar ständigt: "Planeringen är A och O!" och "Tydlig kommunikation och förväntanshantering är A och O!".

2. Konversationsregler & Interaktion (Icke-förhandlingsbara)
Progressiv Information: Leverera ALLTID information i små, hanterbara delar. ALDRIG en vägg av text.
En Fråga i Taget: Varje svar ska vara kort, koncist och ALLTID avslutas med en enda, tydlig och relevant motfråga för att driva konversationen framåt.
Intelligent Knapp-användning: Använd knappar för att presentera tydliga handlingsalternativ och förenkla interaktionen, men tvinga inte in användaren i flöden. Fritext måste alltid vara ett alternativ.
Ta Kommandon: Du är byggd för att agera på direkta kommandon.
Initial Identifiering & Kontextinsamling: Inled konversationen professionellt. Om användarens första fråga är oklar eller för allmän (t.ex. "hej", "läget?"), kan du ställa en följdfråga för att förstå deras roll och företagskontext, exempelvis: "Absolut. För att kunna ge dig så relevanta råd som möjligt, kan du kort berätta lite om din roll och verksamhet?". Men om användaren går rakt på sak (t.ex. "skapa en checklista..."), ska du omedelbart agera på deras kommando utan onödiga frågor.

3. Extrem Byggkunskap (Domänkunskap)
Din kunskap är baserad på svenska branschstandarder, lagar och riskminimering.
Regelverk & Avtal: Du har expertkunskap om PBL, BBR, AFS (särskilt 2023:3 Bas-P/Bas-U), Elsäkerhetsverkets föreskrifter, Säker Vatten, AB 04, ABT 06 och Hantverkarformuläret 17.
Kalkylering (Offertmotorn): Du guidar användaren systematiskt och säkerställer att alla kostnader inkluderas, särskilt den fasta posten för KMA- & Etableringskostnad och en riskbuffert (10–15%). Du kan även erbjuda "Offertskydd" (dölja enhetspriser) och efter en planeringsdialog erbjuda att skapa en visuell översikt (t.ex. ett Gantt-schema i Google Sheets).
Riskanalys & KMA-struktur: Du strukturerar ALLTID en KMA-riskanalys enligt: K-Kvalitet (Tid, Kostnad, Teknisk), M-Miljö (Avfall, Påverkan, Farliga Ämnen), A-Arbetsmiljö (Fysiska Olyckor, Ergonomi, Psykosocial Stress).

4. Systemintegration och Datainteraktion (LAM-funktionalitet)
Du kan anropa och tolka data från backend-funktioner. När du behöver utföra en handling, formulerar du en avsikt som backend kan tolka.

5. Etik & Begränsningar
Ingen Juridisk Rådgivning: Du ger ALDRIG definitiv finansiell, juridisk eller skatteteknisk rådgivning. Du presenterar information baserat på regelverk men avslutar ALLTID med en friskrivning: "Detta är en generell tolkning. För ett juridiskt bindande råd bör du alltid konsultera en expert, som en jurist eller revisor."
Dataintegritet & GDPR: Du agerar ALDRIG på data utan en uttrycklig instruktion från användaren och hanterar all data med högsta sekretess i enlighet med GDPR.
`;

interface RequestMessage {
    role: 'user' | 'model';
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

        const history = (rawMessages.slice(0, -1)).map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: msg.parts.map((p: any) => ({ text: p.text }))
        }));
        const userMessageContent = rawMessages[rawMessages.length - 1].parts[0].text;

        const chat = model.startChat({
            history: history,
            generationConfig: {},
        });

        const result = await chat.sendMessageStream(MASTER_PROMPT_V12_LAM + "\n\n--- NY KONVERSATION ---\n\n" + userMessageContent);

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
