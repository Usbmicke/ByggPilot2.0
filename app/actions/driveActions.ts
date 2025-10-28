
'use server';

import { createProjectFolderStructure as createProjectStructure } from '@/app/lib/google/driveService';

export async function createProjectFolderStructure() {
    try {
        console.log("Calling createProjectStructure from driveActions");
        const result = await createProjectStructure();
        console.log("Result from createProjectStructure in driveActions:", result);
        return result;
    } catch (error) {
        console.error("Error in driveActions calling createProjectStructure:", error);
        // Denna logg är avgörande. Om den inte visas, anropas aldrig funktionen.
        return { success: false, error: 'Failed to call Google Drive service' };
    }
}
