
import { NextResponse } from 'next/server';
import { admin } from '@/app/lib/firebase-admin'; 
import { ChatMessage, FlowState } from '@/app/types';
import { URL } from 'url';

const sendReply = (text: string, flowState?: FlowState) => {
    const response: ChatMessage = {
        role: 'assistant',
        content: text,
        ...(flowState && { flowState }),
    };
    // Nu skickar vi objektet direkt under en 'reply'-nyckel
    return NextResponse.json({ reply: response });
};

async function handleCreateFolder(idToken: string, requestUrl: string) {
    console.log('[Orchestrator] Executing direct action: create folder structure.');
    try {
        const driveApiUrl = new URL('/api/drive/create-project-folder', requestUrl).toString();
        
        const driveResponse = await fetch(driveApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });

        if (!driveResponse.ok) {
            const errorData = await driveResponse.json();
            return sendReply(`Jag stötte på ett problem när jag skulle skapa mapparna: ${errorData.error || 'Okänt fel'}.`);
        }
        
        const successData = await driveResponse.json();
        const replyText = "Utmärkt! Jag har skapat din grundläggande mappstruktur i din Google Drive under namnet **ByggPilot Projekt**.\n\nVad vill du göra härnäst?";
        return sendReply(replyText);

    } catch (error) {
        console.error("[Orchestrator] Internal error during folder creation flow:", error);
        return sendReply("Ett oväntat internt fel uppstod.");
    }
}

export async function POST(request: Request) {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization token is missing or invalid' }, { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
        await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        return NextResponse.json({ error: 'Invalid or expired authorization token' }, { status: 403 });
    }

    const body = await request.json();
    const { messages, action } = body;

    if (action === 'create_folder_structure') {
        return await handleCreateFolder(idToken, request.url);
    }

    if (messages && messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1];
        // Logik för att analysera meddelandet kan läggas till här i framtiden.
    }

    // ÅTERSTÄLLD FALLBACK: Ett mer normalt svar.
    return sendReply(`Jag är en tidig version och förstod inte riktigt det där. Du kan be mig att 'skapa ett nytt projekt' eller 'starta en ny offert'.`);
}
