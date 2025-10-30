
// FAS 1 & 3: Funktioner för Data Access Layer (DAL)
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { z } from 'zod';

// --- Datatyper och Enums ---
// FAS 3: Standardiserar projektstatusar
export enum ProjectStatus {
    NotStarted = 'NOT_STARTED',
    Active = 'ACTIVE',
    Paused = 'PAUSED',
    Completed = 'COMPLETED',
    Cancelled = 'CANCELLED'
}

// Dummy-datatyper för att matcha UI-designen (kommer att ersättas med Zod-schema)
interface Project {
    id: string;
    name: string;
    customer: string;
    address: string;
    status: number;
    team: { name: string; avatarUrl: string }[];
    rating: number;
}

// --- DAL-funktioner för projekt ---

/**
 * FAS 3: Skapar ett nytt projekt i databasen.
 * Denna funktion anropas av AI-verktyget `startProject`.
 */
export async function createProject(userId: string, projectName: string, customerName: string, address: string) {
    try {
        console.log(`DAL: Skapar projektet "${projectName}" för användare ${userId}`);
        const projectRef = firestoreAdmin.collection('projects').doc();
        const newProject = {
            id: projectRef.id,
            userId,
            name: projectName,
            customer: customerName,
            address,
            status: ProjectStatus.Active, // Sätts som standard till "Aktiv"
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await projectRef.set(newProject);
        console.log(`DAL: Projekt med ID ${projectRef.id} har skapats.`);
        return { success: true, projectId: projectRef.id, message: `Projektet "${projectName}" har startats.` };
    } catch (error) {
        console.error("DAL Error in createProject:", error);
        return { success: false, message: "Kunde inte skapa projektet i databasen." };
    }
}


// Simulerar hämtning av projektstatistik
export async function getProjectStats(userId: string): Promise<{ total: number; ongoing: number; revenue: number }> {
    // TODO: Byt ut dummy-data mot riktiga Firestore-anrop
    console.log(`DAL: Hämtar projektstatistik för användare ${userId}`);
    return {
        total: 12,
        ongoing: 5,
        revenue: 842500,
    };
}

// Simulerar hämtning av aktiva projekt
export async function getActiveProjects(userId: string): Promise<Project[]> {
    // TODO: Byt ut dummy-data mot riktiga Firestore-anrop
    console.log(`DAL: Hämtar aktiva projekt för användare ${userId}`);
    return [
        {
            id: '1',
            name: 'Altanbygge, Kv. Eken',
            customer: 'Anna Bergqister',
            address: '173-2993',
            status: 75,
            team: [{name: 'user1', avatarUrl: ''}, {name: 'user2', avatarUrl: ''}],
            rating: 3,
        },
        {
            id: '2',
            name: 'Takbyte & Fasadmålning',
            customer: 'Familjen Löfgren',
            address: '173-3012',
            status: 40,
            team: [{name: 'user1', avatarUrl: ''}, {name: 'user2', avatarUrl: ''}, {name: 'user3', avatarUrl: ''}],
            rating: 5,
        }
    ];
}

