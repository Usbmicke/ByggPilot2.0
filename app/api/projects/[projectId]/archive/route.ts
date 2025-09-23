
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { getProject } from '@/app/services/projectService';
import { archiveProjectInFirestore } from '@/app/services/firestoreService';

/**
 * API-rutt för att arkivera ett projekt.
 * Använder HTTP POST-metoden för att indikera en tillståndsändring.
 */
export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
    const session = await auth();
    const userId = session?.user?.id;
    const { projectId } = params;

    if (!userId) {
        return NextResponse.json({ message: 'Autentisering krävs' }, { status: 401 });
    }

    if (!projectId) {
        return NextResponse.json({ message: 'Projekt-ID krävs' }, { status: 400 });
    }

    try {
        // Först, verifiera att användaren äger projektet och att det existerar
        const project = await getProject(projectId, userId);
        if (!project) {
            // Använder samma logik som i getProjectFromFirestore: om projektet är arkiverat eller inte finns,
            // nekas åtkomst. Detta förhindrar dubbelarkivering.
            return NextResponse.json({ message: 'Åtkomst nekad eller så finns inte projektet' }, { status: 403 });
        }

        // Arkivera projektet i databasen
        await archiveProjectInFirestore(projectId);

        // Returnera ett framgångsmeddelande
        return NextResponse.json({ message: 'Projektet har arkiverats' }, { status: 200 });

    } catch (error) {
        console.error(`Fel vid arkivering av projekt ${projectId}:`, error);
        return NextResponse.json({ message: 'Internt serverfel' }, { status: 500 });
    }
}
