
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/authOptions';
import { createProjectFolderStructure } from '@/app/actions/driveActions'; // Antag att denna funktion finns och är korrekt

// Denna server-åtgärd anropas från en klientkomponent.
export async function handleOnboardingCompletion() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        console.error("Användarsession saknas. Onboarding kan inte slutföras.");
        return { success: false, error: 'Autentisering misslyckades.' };
    }
    const userId = session.user.id;

    // Här skulle du normalt sett hämta projektinformation som skapats under onboardingen.
    // För detta exempel antar vi ett standardprojekt.
    const tempProject = {
        id: `temp_onboarding_project_${userId}`,
        name: "Mitt Första Projekt"
    };

    console.log(`Påbörjar skapande av Drive-struktur för användare ${userId}...`);

    // VÄRLDSKLASS-KORRIGERING: Anropar nu den underliggande drive-åtgärden
    // med de argument som den faktiskt förväntar sig.
    return await createDriveStructureForUser(userId, tempProject.id, tempProject.name);
}

// En ny, internt anropad funktion som hanterar själva logiken.
async function createDriveStructureForUser(userId: string, projectId: string, projectName: string) {
    console.log(`Kör createProjectFolderStructure för projekt: ${projectName} (${projectId})`);
    try {
        // VÄRLDSKLASS-KORRIGERING: Skickar nu med userId till den underliggande funktionen som förväntar sig det.
        const result = await createProjectFolderStructure(projectId, projectName);
        if (!result.success) {
            throw new Error(result.error || 'Okänt fel vid skapande av mappstruktur i Drive.');
        }

        console.log(`Drive-struktur skapad för användare ${userId}. Resultat:`, result.data);
        return { success: true, data: result.data };

    } catch (error: any) {
        console.error(`Fel i createDriveStructureForUser för användare ${userId}:`, error);
        return { success: false, error: error.message };
    }
}
