
'use server';

import { adminDb } from '@/lib/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createFolder } from '@/lib/drive';
import { revalidatePath } from 'next/cache';
import { Project, Invoice, Ata } from '@/types'; // Importera Ata-typen

interface ProjectData {
  name: string;
  address?: string;
  customerId: string;
  customerName: string;
}

// ... (alla andra funktioner förblir oförändrade)

// Hämtar alla projekt för en användare
export async function getProjects(userId: string) {
  // ...
}

// Hämtar ett enskilt projekt för en användare
export async function getProject(projectId: string, userId: string): Promise<{ success: boolean; data?: Project; error?: string; }> {
    if (!userId || !projectId) {
        return { success: false, error: 'Användar-ID och Projekt-ID är obligatoriska.' };
    }
    try {
        const projectDoc = await adminDb.collection('users').doc(userId).collection('projects').doc(projectId).get();

        if (!projectDoc.exists) {
            return { success: false, error: 'Projektet hittades inte eller så saknas behörighet.' };
        }

        const projectData = JSON.parse(JSON.stringify(projectDoc.data()));
        const project: Project = { id: projectDoc.id, ...projectData } as Project;
        
        return { success: true, data: project };

    } catch (error) {
        console.error(`Fel vid hämtning av projekt ${projectId}:`, error);
        return { success: false, error: 'Kunde inte hämta projekt från servern.' };
    }
}

// Hämtar en enskild faktura för ett projekt
export async function getInvoice(projectId: string, invoiceId: string, userId: string): Promise<{ success: boolean; data?: Invoice; error?: string; }> {
    if (!userId || !projectId || !invoiceId) {
        return { success: false, error: 'Användar-ID, Projekt-ID och Faktura-ID är obligatoriska.' };
    }
    try {
        const invoiceDoc = await adminDb.collection('users').doc(userId).collection('projects').doc(projectId).collection('invoices').doc(invoiceId).get();

        if (!invoiceDoc.exists) {
            return { success: false, error: 'Fakturan hittades inte eller så saknas behörighet.' };
        }

        const invoiceData = JSON.parse(JSON.stringify(invoiceDoc.data()));
        const invoice: Invoice = { id: invoiceDoc.id, ...invoiceData } as Invoice;

        return { success: true, data: invoice };

    } catch (error) {
        console.error(`Fel vid hämtning av faktura ${invoiceId}:`, error);
        return { success: false, error: 'Kunde inte hämta fakturan från servern.' };
    }
}

// Hämtar en enskild ÄTA för ett projekt
export async function getAta(projectId: string, ataId: string, userId: string): Promise<{ success: boolean; data?: Ata; error?: string; }> {
    if (!userId || !projectId || !ataId) {
        return { success: false, error: 'Användar-ID, Projekt-ID och ÄTA-ID är obligatoriska.' };
    }
    try {
        const ataDoc = await adminDb
            .collection('users').doc(userId)
            .collection('projects').doc(projectId)
            .collection('atas').doc(ataId)
            .get();

        if (!ataDoc.exists) {
            return { success: false, error: 'ÄTA-dokumentet hittades inte eller så saknas behörighet.' };
        }

        const ataData = JSON.parse(JSON.stringify(ataDoc.data()));
        const ata: Ata = { id: ataDoc.id, ...ataData } as Ata;

        return { success: true, data: ata };

    } catch (error) {
        console.error(`Fel vid hämtning av ÄTA ${ataId}:`, error);
        return { success: false, error: 'Kunde inte hämta ÄTA från servern.' };
    }
}
