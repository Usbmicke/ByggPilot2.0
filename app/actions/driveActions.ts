
'use server';

import { createProjectSpecificFolderStructure } from '@/app/lib/google/driveService';

export async function createProjectFolderStructure(projectId: string, projectName: string) {
    try {
        console.log(`Calling createProjectSpecificFolderStructure for project: ${projectName}`);
        const result = await createProjectSpecificFolderStructure(projectName);
        console.log("Result from createProjectSpecificFolderStructure in driveActions:", result);
        return result;
    } catch (error) {
        console.error("Error in driveActions calling createProjectSpecificFolderStructure:", error);
        return { success: false, error: 'Failed to call Google Drive service' };
    }
}
