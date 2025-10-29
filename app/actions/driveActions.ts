
'use server';

import { createProjectFolderStructure as createDriveFolder } from '@/app/lib/google/driveService';

/**
 * Denna server-åtgärd anropas för att skapa en standardiserad mappstruktur för ett nytt projekt.
 * VÄRLDSKLASS-KORRIGERING: Byter namn på den importerade funktionen för tydlighet och
 * korrigerar det felaktiga funktionsanropet.
 */
export async function createProjectFolderStructure(projectId: string, projectName: string) {
    try {
        console.log(`[driveActions] Anropar createDriveFolder för projekt: ${projectName} (${projectId})`);
        
        // VÄRLDSKLASS-KORRIGERING: Anropar den korrekta, importerade funktionen.
        const result = await createDriveFolder(projectName);
        
        console.log("[driveActions] Resultat från createDriveFolder:", result);
        return result;
    } catch (error) {
        console.error("[driveActions] Fel vid anrop av createDriveFolder:", error);
        // Säkerställ att ett konsekvent felobjekt returneras
        const errorMessage = error instanceof Error ? error.message : 'Okänt fel i Google Drive-tjänsten';
        return { success: false, error: errorMessage };
    }
}
