
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getToken } from 'next-auth/jwt';
import { firestoreAdmin } from '@/lib/firebase-admin';
import { promoteProspectToActiveProject } from '@/actions/promoteProjectActions';
import { saveMessagesToHistory, getMessageHistory } from '@/services/chatHistoryService';

const apiKey = process.env.GEMINI_API_KEY;
const MODEL_ID = process.env.GEMINI_MODEL_ID || 'gemini-1.5-flash-latest';

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
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token || !token.sub) {
            return new NextResponse(JSON.stringify({ error: 'Authentication required' }), { status: 401 });
        }
        const userId = token.sub;

        const { messages: rawMessages } = await req.json();
        const userMessage = rawMessages[rawMessages.length - 1];

        // Hämta långtidsminnet (chatt-historiken)
        const history = await getMessageHistory(userId, 30);

        // Hämta arbetsminnet (dynamisk kontext)
        const dynamicContext = await getContext(userId);

        const ACTION_PROMPT = `... [Din action prompt här, oförändrad] ...`; // Inkludera din befintliga action-prompt

        const finalPrompt = `${MASTER_PROMPT}\n\n${dynamicContext}\n\n${ACTION_PROMPT}\n\n--- KONVERSATION ---\nuser: ${userMessage.parts[0].text}`;

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(finalPrompt);
        const modelResponse = { role: 'model', parts: [{ text: result.response.text() }] };

        let finalMessageText = modelResponse.parts[0].text;

        // ... [Din befintliga action-hanteringslogik här] ...
        try {
          const potentialAction = JSON.parse(modelResponse.parts[0].text.trim());
          if (potentialAction.action === 'promoteProject') {
             // ... logik för att anropa promote ...
             // finalMessageText = "... bekräftelse ...";
             modelResponse.parts[0].text = finalMessageText; 
          }
        } catch (e) {}

        // SPARA TILL LÅNGTIDSMINNET
        await saveMessagesToHistory(userId, [userMessage, modelResponse]);

        return NextResponse.json({ role: 'model', parts: [{ text: finalMessageText }] });

    } catch (error) {
        console.error('[Chat API Error]', error);
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
