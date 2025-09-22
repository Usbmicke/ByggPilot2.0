
import { firestoreAdmin } from '@/app/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Project, RiskAnalysis } from '@/app/types';

const db = firestoreAdmin;

// ===============================================
// ANVÄNDAR-FUNKTIONER (Befintlig logik)
// ===============================================

// (Denna del används implicit av NextAuth för att hämta och skapa användare)

// ===============================================
// PROJEKT-FUNKTIONER (Ny logik)
// ===============================================

const projectsCollection = db.collection('projects');

/**
 * Skapar ett nytt projekt i Firestore.
 */
export const createProjectInFirestore = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const now = FieldValue.serverTimestamp();
    const newProjectData = {
        ...projectData,
        createdAt: now,
        lastActivity: now,
        archivedAt: null,
        riskAnalysisJson: null, // Fält för att lagra AI-analysen
    };
    const docRef = await projectsCollection.add(newProjectData);
    return { id: docRef.id, ...projectData };
};

/**
 * Hämtar ett enskilt projekt från Firestore.
 */
export const getProjectFromFirestore = async (projectId: string): Promise<Project | null> => {
    const doc = await projectsCollection.doc(projectId).get();
    if (!doc.exists) {
        return null;
    }
    const data = doc.data() as Omit<Project, 'id'>;
    return { id: doc.id, ...data };
};

/**
 * Uppdaterar ett projekt i Firestore.
 */
export const updateProjectInFirestore = async (projectId: string, updates: Partial<Project>): Promise<void> => {
    const updateData = {
        ...updates,
        lastActivity: FieldValue.serverTimestamp(),
    };
    await projectsCollection.doc(projectId).update(updateData);
};


// Exportera den primära databas-instansen för generell användning
export { db };
