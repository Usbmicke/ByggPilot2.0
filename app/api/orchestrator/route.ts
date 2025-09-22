
import { NextResponse } from 'next/server';
import { auth as adminAuth } from '@/app/lib/firebase/admin';
import { ChatMessage, FlowState } from '@/app/types';
import { URL } from 'url';

const sendReply = (text: string, flowState?: FlowState) => {
    const response: ChatMessage = {
        role: 'assistant',
        content: text,
        ...(flowState && { flowState }),
    };
    return NextResponse.json({ reply: response });
};

// Funktion för att hantera själva mapp-skapandet
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
            console.error('[Orchestrator] Drive API call failed:', errorData);
            return sendReply(`Jag stötte på ett problem när jag skulle skapa mapparna: ${errorData.error || 'Okänt fel'}. Försök igen eller kontakta support.`);
        }
        
        const successData = await driveResponse.json();
        console.log('[Orchestrator] Drive API call successful:', successData);

        const replyText = "Utmärkt! Jag har skapat din grundläggande mappstruktur i din Google Drive under namnet **ByggPilot Projekt**.\n\nNu är din grund-setup klar! Vad vill du göra härnäst? Du kan till exempel be mig att: \n- **Skapa ett nytt projekt** \n- **Starta en ny offert**";
        return sendReply(replyText);

    } catch (error) {
        console.error("[Orchestrator] Internal error during folder creation flow:", error);
        return sendReply("Ett oväntat internt fel uppstod. Försök igen.");
    }
}

export async function POST(request: Request) {
    // --- 1. Autentisering ---
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization token is missing or invalid' }, { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
        await adminAuth.verifyIdToken(idToken);
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        return NextResponse.json({ error: 'Invalid or expired authorization token' }, { status: 403 });
    }

    // --- 2. Meddelandehantering och Order-analys ---
    const body = await request.json();
    const { messages, action } = body;

    // NYTT: Direkt orderhantering
    if (action === 'create_folder_structure') {
        return await handleCreateFolder(idToken, request.url);
    }

    // GAMMALT: Konversations-baserad logik (behålls som fallback)
    if (messages && messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1];
        const lastAssistantMessage = messages.length > 1 ? messages[messages.length - 2] : null;

        const isAskingToCreateFolders = lastAssistantMessage?.content.includes('Ska jag skapa mappstrukturen nu?');
        const isUserSayingYes = lastUserMessage.content.trim().toLowerCase() === 'ja';

        if (isAskingToCreateFolders && isUserSayingYes) {
            return await handleCreateFolder(idToken, request.url);
        }
    }

    // --- X. Fallback-svar ---
    return sendReply(`Jag är osäker på hur jag ska tolka detta. Försök formulera om dig.`);
}
