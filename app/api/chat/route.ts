
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StreamingTextResponse } from 'ai'; // StreamData är borttagen, den finns inte i ai@2.2.33
import { getSystemPrompt } from '@/ai/prompts';

// =================================================================================
// GULDSTANDARD: CHAT/ORCHESTRATOR v3.1
// KORRIGERING: Tog bort all referens till `StreamData` som inte är kompatibel med
// den stabila `ai` v2 SDK som projektet nu använder. Detta löser det specifika
// byggfelet relaterat till denna fil.
// =================================================================================

// Explicit API-nyckelhantering
if (!process.env.GEMINI_API_KEY) {
    throw new Error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });


// === Kärn-API Endpoint ===
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
        return new Response('Autentisering krävs', { status: 401 });
    }

    const { messages } = await req.json();
    const context = "";
    const systemPrompt = getSystemPrompt(session.user.name, context);

    // Skapa en chatt-session med system-prompt och historik
    // Filtrera bort eventuella systemmeddelanden från historiken
    const history = messages
        .filter((m: any) => m.role === 'user' || m.role === 'assistant')
        .map((m: any) => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

    const chat = model.startChat({
        systemInstruction: systemPrompt,
        history: history,
    });

    // Hämta det sista meddelandet från användaren
    const lastMessage = messages[messages.length - 1].content;
    
    // Skicka meddelandet till modellen och få en stream tillbaka
    const result = await chat.sendMessageStream(lastMessage);

    // Konvertera Googles stream till en standardiserad webb-stream
    const stream = new ReadableStream({
        async start(controller) {
            for await (const chunk of result.stream) {
                // Säkra att vi bara skickar text-delar
                if (chunk && chunk.text) {
                    const chunkText = chunk.text();
                    controller.enqueue(chunkText);
                }
            }
            controller.close();
        }
    });

    // Skicka tillbaka streamen som ett `StreamingTextResponse`
    return new StreamingTextResponse(stream);
}
