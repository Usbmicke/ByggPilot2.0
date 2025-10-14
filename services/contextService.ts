
'use server';

import { listFiles } from '@/services/driveService'; // UPPDATERAD: Korrekt sökväg
import { getProjects } from '@/actions/projectActions';

// =================================================================================
// CONTEXT SERVICE V1.1
// BESKRIVNING: Importerar nu `listFiles` från den nya, centraliserade
// `driveService` istället för den generiska `lib/google`. Detta slutför
// centraliseringen av datakällor enligt Fas 2 i arkitekturplanen.
// =================================================================================

async function fetchProjects(userId: string): Promise<string> {
    try {
        const { projects, error } = await getProjects(userId);
        if (error) {
            throw new Error(error);
        }

        if (projects && projects.length > 0) {
            const projectList = projects
                .map(p => `(Namn: ${p.name}, ID: ${p.id}, Status: ${p.status})`)
                .join(', ');
            return `Användarens projekt: ${projectList}`;
        } else {
            return "Användaren har inga projekt.";
        }
    } catch (err) {
        console.error("[ContextService - Projects] Fel:", err);
        return "Projektinformation kunde inte hämtas.";
    }
}

async function fetchDriveFiles(userId: string, driveFolderId: string): Promise<string> {
    try {
        const files = await listFiles(userId, driveFolderId);
        if (files.length > 0) {
            const fileList = files.map(f => `(Filnamn: ${f.name}, ID: ${f.id})`).join(', ');
            return `Användarens filer: ${fileList}`;
        } else {
            return "Användarens Drive-mapp är tom.";
        }
    } catch (err) {
        console.error("[ContextService - Drive] Fel:", err);
        return "Filinformation från Google Drive kunde inte hämtas.";
    }
}

export async function getChatContext(userId: string, driveFolderId: string | null | undefined): Promise<string> {
    const contextParts: string[] = [];

    const projectPromise = fetchProjects(userId);
    
    let drivePromise: Promise<string>;
    if (driveFolderId) {
        drivePromise = fetchDriveFiles(userId, driveFolderId);
    } else {
        drivePromise = Promise.resolve("Drive-mapp är inte konfigurerad.");
    }

    // Kör båda hämtningarna parallellt för prestanda
    const [projectResult, driveResult] = await Promise.all([projectPromise, drivePromise]);

    contextParts.push(projectResult);
    contextParts.push(driveResult);

    // Bygg en enda, platt och säker sträng. Inga radbrytningar.
    return contextParts.join('. ');
}
