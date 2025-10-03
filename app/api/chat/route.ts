// Använder Googles officiella SDK direkt för att kringgå problemen med 'ai'-biblioteket.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from '@/app/ai/prompts';

// Definierar CoreMessage lokalt för att helt ta bort beroendet till det trasiga 'ai'-biblioteket.
interface CoreMessage {
    role: 'user' | 'model' | 'system' | 'assistant';
    content: string;
}

const MODEL_NAME = "gemini-1.5-flash"; // <-- HÄR ÄR ÄNDRINGEN
const API_KEY = process.env.GEMINI_API_KEY;

export const runtime = 'edge';

export async function POST(req: Request) {
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY är inte satt i dina miljövariabler." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { messages }: { messages: CoreMessage[] } = await req.json();

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // Konvertera meddelandehistoriken till det format som Googles SDK förväntar sig.
        const history = messages
            .filter(m => m.role === 'user' || m.role === 'model' || m.role === 'assistant')
            .map(m => ({
                role: (m.role === 'model' || m.role === 'assistant') ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));
        
        const lastMessage = history.pop();
        if (!lastMessage) {
            return new Response(JSON.stringify({ error: "Inga meddelanden att skicka." }), { status: 400 });
        }

        const result = await model.generateContentStream({
            contents: [...history, lastMessage],
            systemInstruction: {
                role: "system",
                parts: [{ text: SYSTEM_PROMPT }]
            },
        });
        
        // Skapa en ReadableStream för att skicka svaret direkt till klienten.
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                       controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            }
        });

        // Returnera strömmen som svar.
        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error: any) {
        console.error('[API_ROUTE_ERROR]', error);
        return new Response(JSON.stringify({ error: error.message || "Ett okänt fel inträffade" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
