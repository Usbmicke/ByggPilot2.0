
import { 
    getProjectFromFirestore, 
    listProjectsForUserFromFirestore, 
    updateProjectInFirestore,
    createProjectInFirestore,
    getHighestProjectNumberFromFirestore, // Importera den nya databasfunktionen
} from './firestoreService';
import { Project, RiskAnalysis } from '@/app/types/index';

/**
 * **NY FUNKTION**
 * Hämtar det högsta befintliga projektnumret för en användare och returnerar nästa nummer i serien.
 * @param userId Användarens ID.
 * @returns Nästa tillgängliga projektnummer (t.ex. 1001).
 */
export const getNextProjectNumber = async (userId: string): Promise<number> => {
    try {
        const highestNumber = await getHighestProjectNumberFromFirestore(userId);
        return highestNumber + 1;
    } catch (error) {
        console.error("Error fetching next project number, defaulting to 1001:", error);
        // Om ett fel uppstår (t.ex. inga projekt finns), starta från 1001.
        return 1001;
    }
};

/**
 * Hämtar ett enskilt, AKTIVT projekt, men endast om det tillhör den angivna användaren.
 * @param projectId Projektets ID.
 * @param userId Användarens ID för ägarskapskontroll.
 * @returns Projektobjektet eller null om det inte hittas, är arkiverat, eller inte ägs av användaren.
 */
export const getProject = async (projectId: string, userId: string): Promise<Project | null> => {
    const project = await getProjectFromFirestore(projectId);

    if (!project || project.ownerId !== userId) { 
        return null; 
    }

    return project;
};

/**
 * Listar alla AKTIVA projekt för en specifik användare.
 * @param userId Användarens ID.
 * @returns En lista med oarkiverade projekt.
 */
export const listProjectsForUser = async (userId: string): Promise<Project[]> => {
    return await listProjectsForUserFromFirestore(userId);
};

/**
 * Mellanhand för att skapa ett projekt.
 */
export const createProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    return await createProjectInFirestore(projectData);
};

/**
 * Mellanhand för att uppdatera ett projekt.
 */
export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<void> => {
    await updateProjectInFirestore(projectId, updates);
};

/**
 * Specifik uppdatering för att spara en riskanalys.
 */
export const updateProjectWithRiskAnalysis = async (projectId: string, analysis: RiskAnalysis, documentUrl: string | null): Promise<void> => {
    const updates: Partial<Project> = {
        riskAnalysisJson: JSON.stringify(analysis)
    };
    
    await updateProjectInFirestore(projectId, updates);
};
