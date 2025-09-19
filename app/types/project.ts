import { Timestamp } from 'firebase/firestore';

/**
 * Definierar status för ett projekt, vilket styr färgkodning och flöden.
 */
export type ProjectStatus = 'Offert' | 'Pågående' | 'Avslutat' | 'Fakturerat';

/**
 * Definierar den centrala typen för ett Projekt i ByggPilot.
 */
export interface Project {
    id: string;                      // Unikt ID för projektet (Firestore document ID)
    userId: string;                  // ID för användaren som äger projektet
    projectNumber: number;           // Sekventiellt projektnummer för användaren

    // --- Grundinformation ---
    projectName: string;             // Namnet på projektet, t.ex. "Badrumsrenovering hos Nilsson"
    clientName: string;              // Kundens namn
    status: ProjectStatus;           // Projektets nuvarande status

    // --- Tidsstämplar ---
    createdAt: Timestamp;            // När projektet skapades i systemet
    updatedAt: Timestamp;            // När projektet senast uppdaterades

    // --- Integrationer ---
    driveFolderId?: string;          // ID till den dedikerade mappen i Google Drive

    // --- Ekonomi (kommer byggas ut) ---
    totalCost?: number;              // Total självkostnad enligt kalkyl
    totalPrice?: number;             // Totalt offererat pris till kund

    // Tillåter andra, ospecificerade fält
    [key: string]: any;
}
