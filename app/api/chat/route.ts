
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authOptions } from "@/lib/auth";
import { firestoreAdmin } from '@/lib/firebase-admin';
import { promoteProspectToActiveProject } from '@/actions/promoteProjectActions';
import { saveMessagesToHistory, getMessageHistory } from '@/services/chatHistoryService';

const apiKey = process.env.GEMINI_API_KEY;
// Val av en stabil "workhorse" modell baserat på dokumentation.
const MODEL_ID = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash-001';

if (!apiKey) {
  throw new Error('GEMINI_API_KEY är inte satt i dina miljövariabler.');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: MODEL_ID });

const MASTER_PROMPT = `
Övergripande Mål: Du är ByggPilot, ett avancerat Large Action Model (LAM). Ditt syfte är att agera som en proaktiv, digital kollega för små och medelstora företag i den svenska byggbranschen.\n\nKärnpersonlighet & Tonfall: Erfaren, lugn, kompetent och förtroendeingivande.\n\nKonversationsregler: Leverera information i små, hanterbara delar. Avsluta med en relevant motfråga. Agera omedelbart på kommandon.\n`;

async function getContext(userId: string): Promise<string> {
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

    return `## ARBETSMINNE (Dynamisk Kontext)
Detta är en sammanfattning av relevant data från användarens konto. Använd denna information för att tolka användarens avsikt och koppla den till rätt data-ID.\n\n${prospectContext}${activeProjectContext}${customerContext}`.trim();
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return new NextResponse(JSON.stringify({ error: 'Authentication required' }), { status: 401 });
        }
        const userId = session.user.id;

        const { messages: rawMessages } = await req.json();
        if (!rawMessages || rawMessages.length === 0) {
            return new NextResponse(JSON.stringify({ error: 'Messages are required' }), { status: 400 });
        }
        const userMessage = rawMessages[rawMessages.length - 1];

        const history = await getMessageHistory(userId, 30);
        const dynamicContext = await getContext(userId);
        
        const ACTION_PROMPT = ``; 

        const updatedHistory = [...history, userMessage];

        const fullHistory = updatedHistory
            .filter(h => h.parts && h.parts.length > 0 && h.parts[0].text)
            .map(h => `${h.role}: ${h.parts[0].text}`)
            .join('\n');

        const finalPrompt = `${MASTER_PROMPT}\n\n${dynamicContext}\n\n${ACTION_PROMPT}\n\n--- KONVERSATION ---\n${fullHistory}`;

        const result = await model.generateContent(finalPrompt);
        const responseText = result.response.text();
        const modelResponse = { role: 'model', parts: [{ text: responseText }] };

        await saveMessagesToHistory(userId, [userMessage, modelResponse]);

        return NextResponse.json({ role: 'model', parts: [{ text: responseText }] });

    } catch (error) {
        console.error('[Chat API Error]', error);
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
