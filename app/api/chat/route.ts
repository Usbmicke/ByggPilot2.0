
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StreamingTextResponse, GoogleGenerativeAIStream } from 'ai';
import { getSystemPrompt } from '@/ai/prompts';

// =================================================================================
// CHAT/ORCHESTRATOR v4.1 (BUILD FIX)
// REVIDERING: Tog bort `export const runtime = 'edge';`.
// `firebase-admin` är INTE kompatibelt med Edge-miljön. Genom att ta bort denna rad
// återgår API:et till Node.js-miljön, vilket löser den enorma mängden
// "Module not found" och "Attempted import"-fel som uppstod under byggprocessen.
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

    const lastMessage = messages[messages.length - 1].content;
    
    const result = await chat.sendMessageStream(lastMessage);

    const stream = GoogleGenerativeAIStream(result);

    return new StreamingTextResponse(stream);
}
