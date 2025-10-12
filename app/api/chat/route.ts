
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamUI, generateText } from 'ai/rsc';
import { z } from 'zod';
import { getSystemPrompt } from '@/ai/prompts';
import { Suspense } from 'react';

// =================================================================================
// GULDSTANDARD: CHAT/ORCHESTRATOR v2.0
// BESKRIVNING: Denna fil är nu den enda kontaktpunkten för chatt.
// Den kombinerar AI-konversation, kontextmedvetenhet och verktygsanvändning
// med hjälp av streamUI för att dynamiskt rendera svar och verktyg på klienten.
// Den gamla, separata orkestreraren och chatt-api:et är helt ersatta.
// KORRIGERING: Borttagning av felaktig import av en UI-komponent (Spinner)
// i en API-route. Ersatt med ett textmeddelande.
// =================================================================================

// Explicit API-nyckelhantering
if (!process.env.GEMINI_API_KEY) {
    throw new Error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
}
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const model = google('gemini-1.5-flash-latest');

// === VERKTYGSFUNKTIONER ===
// I en riktig applikation bör dessa ligga i separata service-filer.

async function createOfferPdfTool(args: { title: string; customerName: string; lineItems: { description: string; quantity: number; price: number }[] }) {
    'use server';
    console.log("ANROPAR VERKTYG: createOfferPdf med argument:", args);
    // SIMULERING: I verkligheten anropas ett API för att generera en PDF
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pdfUrl = `/pdfs/offert-${Date.now()}.pdf`;
    console.log(`SIMULERAT RESULTAT: PDF skapad på ${pdfUrl}`);
    return { success: true, pdfUrl, message: `PDF-offert har skapats för ${args.customerName}.` };
}

// === Kärn-API Endpoint ===
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
        return new Response('Autentisering krävs', { status: 401 });
    }

    const { messages } = await req.json();

    // Här kan vi i framtiden hämta dynamisk kontext från databasen
    const context = ""; // Tills vidare tom
    const systemPrompt = getSystemPrompt(session.user.name, context);

    const result = await streamUI({
        model: model,
        system: systemPrompt,
        messages: messages,
        text: ({ content }) => <div className="text-white">{content}</div>,
        tools: {
            createOfferPdf: {
                description: 'Skapar en offert som en PDF. Fråga alltid användaren om all nödvändig information (titel, kundnamn, och minst ett rad-element) innan du anropar verktyget. Bekräfta med användaren innan du skapar offerten.',
                parameters: z.object({
                    customerName: z.string().describe('Kundens fullständiga namn.'),
                    title: z.string().describe('En tydlig titel för offerten.'),
                    lineItems: z.array(z.object({
                        description: z.string().describe('Beskrivning av arbetet eller materialet.'),
                        quantity: z.number().describe('Antal.'),
                        price: z.number().describe('Pris per enhet.'),
                    })).describe('En lista med alla rader i offerten.'),
                }),
                generate: async function* (args) {
                    yield <div className="text-center text-gray-400">Skapar offert...</div>;
                    const { success, pdfUrl, message } = await createOfferPdfTool(args);
                    if (success) {
                        return <div className="text-green-400 p-4 bg-gray-700 rounded-lg">Offert skapad! <a href={pdfUrl} target="_blank" className="underline">Ladda ner PDF</a></div>;
                    } else {
                        return <div className="text-red-400">Kunde inte skapa offert.</div>;
                    }
                }
            },
        },
    });

    return result.value;
}
