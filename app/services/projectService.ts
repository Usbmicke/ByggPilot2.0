
import { 
    getProjectFromFirestore, 
    listProjectsForUserFromFirestore, // Nu finns denna!
    updateProjectInFirestore,
    createProjectInFirestore,
} from './firestoreService';
import { Project, RiskAnalysis } from '@/app/types/index';

/**
 * Hämtar ett enskilt, AKTIVT projekt, men endast om det tillhör den angivna användaren.
 * @param projectId Projektets ID.
 * @param userId Användarens ID för ägarskapskontroll.
 * @returns Projektobjektet eller null om det inte hittas, är arkiverat, eller inte ägs av användaren.
 */
export const getProject = async (projectId: string, userId: string): Promise<Project | null> => {
    const project = await getProjectFromFirestore(projectId);

    // Säkerhetskontroll: Returnera bara projektet om det matchar användarens ID.
    // getProjectFromFirestore hanterar redan arkiverade projekt.
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
    // Liten justering: documentUrl kan vara null om inget dokument skapades.
    const updates: Partial<Project> = {
        riskAnalysisJson: JSON.stringify(analysis)
    };
    
    // Tidigare fanns ett beroende av en URL här. Vi gör det mer robust.
    // Beroende på appens logik kan vi vilja hantera detta annorlunda i framtiden.

    await updateProjectInFirestore(projectId, updates);
};
