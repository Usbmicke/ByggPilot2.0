
// FAS 1 & 3: Funktioner för Data Access Layer (DAL)
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { z } from 'zod';

// --- Datatyper och Enums ---
export enum ProjectStatus {
    NotStarted = 'NOT_STARTED',
    Active = 'ACTIVE',
    Paused = 'PAUSED',
    Completed = 'COMPLETED',
    Cancelled = 'CANCELLED'
}

// Uppdaterad projekttyp för att bättre matcha UI och databasmodell
export interface Project {
    id: string;
    projectName: string;
    clientName: string;
    status: ProjectStatus;
    lastActivity: string; // ISO 8601 date string
    // Lägger till fält för färgkodning och visuella element
    statusColor: 'green' | 'yellow' | 'red' | 'gray';
    progress: number; // Ett värde 0-100 för progress bars
}

export interface DashboardStats {
    totalProjects: number;
    ongoingProjects: number;
    totalRevenue: string; // Formatterad som en sträng, t.ex. "842 500 kr"
}

// --- DAL-funktioner för projekt ---

/**
 * Hämtar statistik för dashboarden.
 * @param userId - Användarens unika ID.
 * @returns Ett objekt med dashboard-statistik.
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    console.log(`DAL: Hämtar projektstatistik för användare ${userId}`);
    try {
        const projectsCollection = firestoreAdmin.collection('projects').where('userId', '==', userId);
        const snapshot = await projectsCollection.get();

        if (snapshot.empty) {
            return { totalProjects: 0, ongoingProjects: 0, totalRevenue: '0 kr' };
        }

        const projects = snapshot.docs.map(doc => doc.data());
        const totalProjects = projects.length;
        const ongoingProjects = projects.filter(p => p.status === ProjectStatus.Active).length;

        // TODO: Implementera riktig intäktsberäkning när datamodellen stödjer det.
        const totalRevenue = "842 500 kr"; // Behåller simulerad data tills vidare.

        console.log(`DAL: Statistik hämtad: ${totalProjects} totalt, ${ongoingProjects} pågående.`);
        return { totalProjects, ongoingProjects, totalRevenue };
    } catch (error) {
        console.error("DAL Error in getDashboardStats:", error);
        // Returnerar ett säkert standardvärde vid fel.
        return { totalProjects: 0, ongoingProjects: 0, totalRevenue: '0 kr' };
    }
}

/**
 * Hämtar alla aktiva projekt för en användare.
 * @param userId - Användarens unika ID.
 * @returns En lista med projekt.
 */
export async function getActiveProjects(userId: string): Promise<Project[]> {
    console.log(`DAL: Hämtar aktiva projekt för användare ${userId}`);
    try {
        const projectsCollection = firestoreAdmin.collection('projects')
            .where('userId', '==', userId)
            .where('status', 'in', [ProjectStatus.Active, ProjectStatus.Paused, ProjectStatus.NotStarted]);
        const snapshot = await projectsCollection.get();

        if (snapshot.empty) {
            console.log('DAL: Inga aktiva projekt hittades.');
            return [];
        }

        const projects: Project[] = snapshot.docs.map(doc => {
            const data = doc.data();
            const status: ProjectStatus = data.status || ProjectStatus.NotStarted;

            // Mappa status till färg
            let statusColor: 'green' | 'yellow' | 'red' | 'gray';
            switch (status) {
                case ProjectStatus.Active:
                    statusColor = 'green';
                    break;
                case ProjectStatus.Paused:
                case ProjectStatus.NotStarted:
                    statusColor = 'yellow';
                    break;
                case ProjectStatus.Cancelled:
                    statusColor = 'red';
                    break;
                default:
                    statusColor = 'gray';
            }
            
            // Simulerar progress för UI, kan ersättas med riktig data sen
            const progress = status === ProjectStatus.Active ? 75 : (status === ProjectStatus.Paused ? 40 : 10);

            return {
                id: doc.id,
                projectName: data.projectName || 'Namnlöst Projekt',
                clientName: data.clientName || 'Okänd Kund',
                status: status,
                lastActivity: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
                statusColor,
                progress,
            };
        });

        console.log(`DAL: Hittade ${projects.length} projekt.`);
        return projects;
    } catch (error) {
        console.error("DAL Error in getActiveProjects:", error);
        return []; // Returnerar en tom lista vid fel för att förhindra krasch.
    }
}

// Befintlig createProject-funktion (lätt refaktorerad för konsistens)
export async function createProject(userId: string, projectName: string, customerName: string) {
    console.log(`DAL: Skapar projektet "${projectName}" för användare ${userId}`);
    try {
        const projectRef = firestoreAdmin.collection('projects').doc();
        const newProject = {
            id: projectRef.id,
            userId,
            projectName,
            clientName: customerName,
            status: ProjectStatus.NotStarted,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await projectRef.set(newProject);
        console.log(`DAL: Projekt med ID ${projectRef.id} har skapats.`);
        return { success: true, projectId: projectRef.id };
    } catch (error) {
        console.error("DAL Error in createProject:", error);
        return { success: false, message: "Kunde inte skapa projektet i databasen." };
    }
}
