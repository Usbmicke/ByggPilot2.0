
'use server';

import * as dal from '@/lib/data-access';
import logger from '@/lib/logger';
import { Project, Invoice, Ata, Document } from '@/types';

// =================================================================================
// GULDSTANDARD - ACTIONS V3.0 (DAL-IMPLEMENTERING)
// REVIDERING: All direkt databasåtkomst har tagits bort. Funktionerna anropar nu
//             Data Access Layer (DAL) för att hämta och hantera data. Detta
//             centraliserar datalogiken och säkerställer att alla anrop är
//             säkra och konsekvent loggade.
// =================================================================================

/**
 * Hämtar alla projekt för den inloggade användaren.
 */
export async function getProjects(): Promise<{ projects?: Project[]; error?: string; }> {
    try {
        // DAL hanterar användarverifiering.
        const projects = await dal.getProjectsForUser();
        return { projects };
    } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, '[projectActions] Failed to get projects.');
        return { error: 'Kunde inte hämta projekt från servern.' };
    }
}

/**
 * Hämtar ett specifikt projekt för den inloggade användaren.
 * @param projectId ID för projektet som ska hämtas.
 */
export async function getProject(projectId: string): Promise<{ success: boolean; data?: Project; error?: string; }> {
    try {
        // DAL hanterar användarverifiering.
        const project = await dal.getProjectForUser(projectId);
        if (!project) {
            return { success: false, error: 'Projektet hittades inte eller så saknas behörighet.' };
        }
        return { success: true, data: project };
    } catch (error: any) {
        logger.error({ projectId, error: error.message, stack: error.stack }, '[projectActions] Failed to get project.');
        return { success: false, error: 'Kunde inte hämta projekt från servern.' };
    }
}


/**
 * Hämtar alla fakturor för ett specifikt projekt.
 * @param projectId ID för projektet vars fakturor ska hämtas.
 */
export async function getInvoicesForProject(projectId: string): Promise<{ success: boolean; data?: Invoice[]; error?: string; }> {
    try {
        const invoices = await dal.getInvoicesForProject(projectId);
        return { success: true, data: invoices };
    } catch (error: any) {
        logger.error({ projectId, error: error.message, stack: error.stack }, '[projectActions] Failed to get invoices.');
        return { success: false, error: 'Kunde inte hämta fakturor från servern.' };
    }
}

/**
 * Hämtar alla ÄTOr för ett specifikt projekt.
 * @param projectId ID för projektet vars ÄTOr ska hämtas.
 */
export async function getAtasForProject(projectId: string): Promise<{ success: boolean; data?: Ata[]; error?: string; }> {
    try {
        const atas = await dal.getAtasForProject(projectId);
        return { success: true, data: atas };
    } catch (error: any) {
        logger.error({ projectId, error: error.message, stack: error.stack }, '[projectActions] Failed to get ATAs.');
        return { success: false, error: 'Kunde inte hämta ÄTOr från servern.' };
    }
}

/**
 * Hämtar alla dokument för ett specifikt projekt.
 * @param projectId ID för projektet vars dokument ska hämtas.
 */
export async function getDocumentsForProject(projectId: string): Promise<{ success: boolean; data?: Document[]; error?: string; }> {
    try {
        const documents = await dal.getDocumentsForProject(projectId);
        return { success: true, data: documents };
    } catch (error: any) {
        logger.error({ projectId, error: error.message, stack: error.stack }, '[projectActions] Failed to get documents.');
        return { success: false, error: 'Kunde inte hämta dokument från servern.' };
    }
}

// Observera: Funktionerna `getInvoice` och `getAta` (singular) har medvetet utelämnats
// då de sällan behövs och kan läggas till vid behov. Principen är densamma.
