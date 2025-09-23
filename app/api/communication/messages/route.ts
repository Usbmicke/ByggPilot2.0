
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { getProject } from '@/app/services/projectService';
import { addMessageToProject, getMessagesForProject } from '@/app/services/firestoreService'; // Funktioner att skapa

/**
 * API-rutt för att hämta befintliga meddelanden.
 */
export async function GET(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;
    
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!userId) {
        return NextResponse.json({ message: 'Autentisering krävs' }, { status: 401 });
    }
    if (!projectId) {
        return NextResponse.json({ message: 'Projekt-ID krävs' }, { status: 400 });
    }

    try {
        // Verifiera att användaren har tillgång till projektet
        const project = await getProject(projectId, userId);
        if (!project) {
            return NextResponse.json({ message: 'Åtkomst nekad' }, { status: 403 });
        }

        // Hämta meddelanden
        const messages = await getMessagesForProject(projectId);
        return NextResponse.json(messages, { status: 200 });

    } catch (error) {
        console.error("Fel vid hämtning av meddelanden:", error);
        return NextResponse.json({ message: 'Internt serverfel' }, { status: 500 });
    }
}


/**
 * API-rutt för att posta nya meddelanden.
 */
export async function POST(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;
    const userName = session?.user?.name || 'Anonym';
    const userAvatar = session?.user?.image || '/default-avatar.png';

    if (!userId) {
        return NextResponse.json({ message: 'Autentisering krävs' }, { status: 401 });
    }

    try {
        const { projectId, text } = await req.json();

        if (!projectId || !text || typeof text !== 'string' || text.trim() === '') {
            return NextResponse.json({ message: 'Projekt-ID och meddelandetext krävs' }, { status: 400 });
        }

        // Verifiera att användaren har tillgång till projektet
        const project = await getProject(projectId, userId);
        if (!project) {
            return NextResponse.json({ message: 'Åtkomst nekad' }, { status: 403 });
        }

        // Skapa meddelandeobjektet
        const newMessage = {
            id: '', // Kommer att sättas av Firestore
            author: {
                id: userId,
                name: userName,
                avatarUrl: userAvatar,
            },
            text: text.trim(),
            timestamp: new Date().toISOString(),
        };

        // Spara meddelandet i databasen
        const savedMessage = await addMessageToProject(projectId, newMessage);

        return NextResponse.json(savedMessage, { status: 201 });

    } catch (error) {
        console.error("Fel vid postning av meddelande:", error);
        return NextResponse.json({ message: 'Internt serverfel' }, { status: 500 });
    }
}
