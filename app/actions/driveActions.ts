
'use server';

import { createProjectFolderStructure as createDriveFolder } from '@/lib/services/googleDriveService';

/**
 * Denna server-åtgärd anropas för att skapa en standardiserad mappstruktur för ett nytt projekt.
 */
export async function createProjectFolderStructure(projectId: string, projectName: string) {
    try {
        console.log(`[driveActions] Anropar createDriveFolder för projekt: ${projectName} (${projectId})`);
        
        const result = await createDriveFolder(projectName);
        
        console.log("[driveActions] Resultat från createDriveFolder:", result);
        return result;
    } catch (error) {
        console.error("[driveActions] Fel vid anrop av createDriveFolder:", error);
        const errorMessage = error instanceof Error ? error.message : 'Okänt fel i Google Drive-tjänsten';
        return { success: false, error: errorMessage };
    }
}
