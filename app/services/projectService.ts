
import { 
    getProjectFromFirestore, 
    listProjectsForUserFromFirestore, // VI BEHÖVER DENNA FÖR ATT LISTA PROJEKT
    updateProjectInFirestore,
    createProjectInFirestore,
} from './firestoreService';
import { Project, RiskAnalysis } from '@/app/types';

/**
 * Hämtar ett enskilt projekt, MEN ENDAST om det tillhör den angivna användaren.
 * @param projectId Projektets ID.
 * @param userId Användarens ID för ägarskapskontroll.
 * @returns Projektobjektet eller null om det inte hittas eller inte ägs av användaren.
 */
export const getProject = async (projectId: string, userId: string): Promise<Project | null> => {
    const project = await getProjectFromFirestore(projectId);

    // Säkerhetskontroll: Returnera bara projektet om det matchar användarens ID.
    if (!project || project.userId !== userId) {
        return null; // Hittades inte eller så har användaren inte behörighet
    }

    return project;
};

/**
 * Listar alla projekt för en specifik användare.
 * @param userId Användarens ID.
 * @returns En lista med projekt.
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
export const updateProjectWithRiskAnalysis = async (projectId: string, analysis: RiskAnalysis, documentUrl: string): Promise<void> => {
    const updates: Partial<Project> = {
        riskAnalysisUrl: documentUrl,
        riskAnalysisJson: JSON.stringify(analysis)
    };
    await updateProjectInFirestore(projectId, updates);
};
