
import {
    getProjectFromFirestore,
    listProjectsForUserFromFirestore,
    updateProjectInFirestore,
    createProjectInFirestore,
    getHighestProjectNumberFromFirestore,
} from './firestoreService';
import { Project, RiskAnalysis, ProjectStatus } from '@/types';


export const getNextProjectNumber = async (userId: string): Promise<number> => {
    try {
        const highestNumber = await getHighestProjectNumberFromFirestore(userId);
        return highestNumber + 1;
    } catch (error) {
        console.error("Error fetching next project number, defaulting to 1001:", error);
        return 1001;
    }
};


export const getProject = async (projectId: string, userId: string): Promise<Project | null> => {
    const project = await getProjectFromFirestore(projectId);

    if (!project || project.ownerId !== userId) {
        return null;
    }

    return project;
};


export const listProjectsForUser = async (userId: string): Promise<Project[]> => {
    return await listProjectsForUserFromFirestore(userId);
};


export const createProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    return await createProjectInFirestore(projectData);
};


export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<void> => {
    await updateProjectInFirestore(projectId, updates);
};


export const updateProjectWithRiskAnalysis = async (projectId: string, analysis: RiskAnalysis, documentUrl: string | null): Promise<void> => {
    const updates: Partial<Project> = {
        riskAnalysisJson: JSON.stringify(analysis)
    };
    await updateProjectInFirestore(projectId, updates);
};

/**
 * GULDSTANDARD-IMPLEMENTERING: Arkiverar ett projekt.
 * Funktionen sätter projektets status till 'Arkiverat' och uppdaterar det i databasen.
 */
export const archiveProject = async (projectId: string, userId: string): Promise<void> => {
    // Hämta först projektet för att säkerställa att användaren äger det.
    const project = await getProject(projectId, userId);
    if (!project) {
        // Om getProject returnerar null, innebär det att projektet inte finns eller att användaren inte har åtkomst.
        throw new Error("Projektet hittades inte eller så har du inte behörighet att arkivera det.");
    }

    const updates: Partial<Project> = {
        status: ProjectStatus.Archived,
        archivedAt: new Date(),
    };

    await updateProjectInFirestore(projectId, updates);
};
