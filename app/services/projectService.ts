
import { 
    getProjectFromFirestore, 
    updateProjectInFirestore,
    createProjectInFirestore,
} from './firestoreService';
import { Project, RiskAnalysis } from '@/app/types';

/**
 * Mellanhand för att hämta ett enskilt projekt.
 * Denna funktion pratar nu med Firestore via firestoreService.
 */
export const getProject = async (projectId: string): Promise<Project | null> => {
    // Framtida behörighetskontroll kan läggas till här
    return await getProjectFromFirestore(projectId);
};

/**
 * Mellanhand för att skapa ett projekt.
 * Denna funktion pratar nu med Firestore via firestoreService.
 */
export const createProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    return await createProjectInFirestore(projectData);
};

/**
 * Mellanhand för att uppdatera ett projekt.
 * Denna funktion pratar nu med Firestore via firestoreService.
 */
export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<void> => {
    await updateProjectInFirestore(projectId, updates);
};

/**
 * Specifik uppdatering för att spara en riskanalys (både URL och JSON-data).
 */
export const updateProjectWithRiskAnalysis = async (projectId: string, analysis: RiskAnalysis, documentUrl: string): Promise<void> => {
    const updates: Partial<Project> = {
        riskAnalysisUrl: documentUrl,
        riskAnalysisJson: JSON.stringify(analysis) // Spara hela JSON-objektet
    };
    await updateProjectInFirestore(projectId, updates);
};

// OBS: Funktioner som listProjects, archiveProject etc. har medvetet utelämnats.
// De behöver också skrivas om för att använda Firestore, men är inte kritiska för att lösa den primära buggen.
// Denna fokuserade uppdatering säkerställer att kärnflödet fungerar först.
