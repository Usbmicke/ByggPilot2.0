
import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content, Part } from '@google/generative-ai';
import { StreamingTextResponse, GoogleGenerativeAIStream, Message } from 'ai';

import { authOptions } from "@/lib/auth";
import { firestoreAdmin } from '@/lib/firebase-admin';
import { saveMessagesToHistory } from '@/services/chatHistoryService';
import { SYSTEM_PROMPT } from '@/ai/prompts';

const apiKey = process.env.GEMINI_API_KEY;

// =================================================================================
// GULD STANDARD - CHAT API (Server-sida)
// Version 10.0 - Holistisk Renovering: Stenhårt Fundament.
// =================================================================================

const MODEL_ID = process.env.GEMINI_MODEL_ID || 'gemini-1.5-flash-001';

if (!apiKey) {
  throw new Error('GEMINI_API_KEY är inte satt i dina miljövariabler.');
}

const genAI = new GoogleGenerativeAI(apiKey);

async function getContext(userId: string): Promise<string> {
    // ... (oförändrad, stabil funktion) ...
    const projectsRef = firestoreAdmin.collection('users').doc(userId).collection('projects');
    const customersRef = firestoreAdmin.collection('users').doc(userId).collection('customers');

    const [prospects, activeProjects, customers] = await Promise.all([
        projectsRef.where('status', '==', 'Anbud').get(),
        projectsRef.where('status', '==', 'Pågående').get(),
        customersRef.get()
    ]);

    const format = (docs: FirebaseFirestore.QuerySnapshot, title: string) => {
        if (docs.empty) return '';
        const items = docs.docs.map(d => `- Namn: \"${d.data().name}\" (ID: ${d.id})`).join('\\n');
        return `${title}:\\n${items}\\n`;
    }

    const prospectContext = format(prospects, 'Anbud som kan godkännas');
    const activeProjectContext = format(activeProjects, 'Pågående projekt som kan administreras (t.ex. för ÄTA)');
    const customerContext = format(customers, 'Befintliga kunder');

    return `## ARBETSMINNE (Dynamisk Kontext)\n${prospectContext}${activeProjectContext}${customerContext}`.trim();
}

const buildGoogleGenAIPrompt = (messages: Message[]): Content[] => {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
};


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ error: 'Autentisering krävs' }), { status: 401 });
    }
    const userId = session.user.id;

    const { messages }: { messages: Message[] } = await req.json();

    // =============================================================================
    // KRITISK VALIDERING: Avvisa begäran om den är tom.
    // Detta är grunden som förhindrar alla efterföljande 500-fel.
    // =============================================================================
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Tom begäran. Inga meddelanden att behandla.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dynamicContext = await getContext(userId);

    const model = genAI.getGenerativeModel({ 
        model: MODEL_ID, 
        systemInstruction: `${SYSTEM_PROMPT}\n\n${dynamicContext}` 
    });
    
    const googlePrompt = buildGoogleGenAIPrompt(messages);
    
    const stream = await model.generateContentStream({
        contents: googlePrompt,
        generationConfig: { temperature: 0.7 },
    });

    const aiStream = GoogleGenerativeAIStream(stream, {
      async onFinal(completion) {
        const lastUserMessage = messages[messages.length - 1];
        // Spara endast om det faktiskt finns något att spara
        if (lastUserMessage && completion) {
          const userMessageToSave = { role: 'user' as const, parts: [{ text: lastUserMessage.content }] };
          const modelResponseToSave = { role: 'model' as const, parts: [{ text: completion }] };
          await saveMessagesToHistory(userId, [userMessageToSave, modelResponseToSave]);
        }
      }
    });

    return new StreamingTextResponse(aiStream);

  } catch (error) {
    console.error('[Chat API Error v10.0]', error);
    const errorResponse = error instanceof Error ? error.message : 'Ett okänt fel uppstod.';
    return new Response(JSON.stringify({ error: 'Internt serverfel', details: errorResponse }), {
       status: 500,
       headers: { 'Content-Type': 'application/json' },
    });
  }
}
