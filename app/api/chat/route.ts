// Använder Firebase Admin SDK för att interagera med Vertex AI (Gemini)
import { getVertexAI } from 'firebase-admin/vertex-ai';
import { admin } from '@/app/lib/firebase-admin';
import { SYSTEM_PROMPT } from '@/app/ai/prompts';

// Lokal typdefinition för att undvika externa beroenden.
interface CoreMessage {
    role: 'user' | 'model' | 'assistant';
    content: string;
}

// Använder en stabil och kapabel modell som är tillgänglig via Vertex AI.
const MODEL_NAME = "gemini-1.5-flash-001";

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        // Säkerställer att Firebase Admin SDK har initierats korrekt.
        if (!admin.apps.length) {
            console.error('Firebase Admin SDK är inte initierad.');
            return new Response(JSON.stringify({ error: "Server-konfigurationsfel: Firebase Admin SDK är inte tillgänglig." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { messages }: { messages: CoreMessage[] } = await req.json();

        // Hämta Vertex AI-tjänsten via den befintliga Firebase Admin-instansen.
        // Detta hanterar autentisering automatiskt via servicekontot.
        const vertexAI = getVertexAI(admin.app());
        const model = vertexAI.getGenerativeModel({ model: MODEL_NAME });

        // Konvertera meddelandehistoriken till det format som Vertex AI SDK förväntar sig.
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
        
        // Skapa en standard ReadableStream för att strömma svaret till klienten.
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                // Hämta streamen från det nya SDK:et
                for await (const chunk of result.stream) {
                    // Kontrollera att det finns text i svaret
                    if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
                        const text = chunk.candidates[0].content.parts[0].text;
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            }
        });

        // Returnera strömmen som text/plain, som klienten förväntar sig.
        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error: any) {
        console.error('[FIREBASE_CHAT_API_ERROR]', error);
        // Ge ett mer informativt felmeddelande vid behov
        const errorMessage = error.message || "Ett okänt fel inträffade i Firebase chat API.";
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
