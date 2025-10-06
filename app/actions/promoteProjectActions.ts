
'use server';

import { firestoreAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getNextProjectNumber } from '@/services/projectService';
import { moveFolder, createFolder } from '@/services/driveService';

async function createAndGetFolderId(userId: string, name: string, parentId: string): Promise<string> {
    const folder = await createFolder(userId, name, parentId);
    if (!folder || !folder.id) {
        throw new Error(`Kunde inte skapa mappen: ${name}`);
    }
    return folder.id;
}

export async function promoteProspectToActiveProject(projectId: string, userId: string) {
    if (!userId || !projectId) {
        return { success: false, error: 'Användar-ID och Projekt-ID är obligatoriska.' };
    }

    const userDocRef = firestoreAdmin.collection('users').doc(userId);
    const projectDocRef = userDocRef.collection('projects').doc(projectId);

    try {
        // Starta en transaktion för att säkerställa dataintegritet
        const promotionResult = await firestoreAdmin.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            const projectDoc = await transaction.get(projectDocRef);

            if (!userDoc.exists) throw new Error('Användaren hittades inte.');
            if (!projectDoc.exists) throw new Error('Projektet (anbudet) hittades inte.');

            const userData = userDoc.data();
            const projectData = projectDoc.data();

            if (projectData?.status !== 'Anbud') {
                throw new Error('Detta projekt är inte ett anbud och kan inte befordras.');
            }

            const driveFolderIds = userData?.googleDrive?.folderIds;
            const currentProjectFolderId = projectData?.googleDrive?.folderId;

            if (!driveFolderIds?.prospects || !driveFolderIds?.active || !currentProjectFolderId) {
                throw new Error('Nödvändiga Google Drive-mappar saknas. Kör "Verifiera & Reparera Mappstruktur".');
            }

            // Generera nästa projektnummer - detta görs inuti transaktionen för att undvika race conditions
            const projectCounter = userData?.projectCounter || 0;
            const nextProjectNumber = projectCounter + 1;
            const projectNumberString = `${new Date().getFullYear()}-${String(nextProjectNumber).padStart(3, '0')}`;
            
            const newFolderName = `${projectNumberString}_${projectData?.customerName} - ${projectData?.name}`;
            
            // Flytta och döp om mappen i Google Drive
            await moveFolder(userId, currentProjectFolderId, driveFolderIds.active, newFolderName);
            
            // Skapa Guldstandardens undermappar
            const subFolderNames = {
                avtal: '1_Avtal & Underlag',
                ekonomi: '2_Ekonomi',
                kma: '3_KMA',
                media: '4_Foton & Media'
            };

            const subFolderIds = {
                avtal: await createAndGetFolderId(userId, subFolderNames.avtal, currentProjectFolderId),
                ekonomi: await createAndGetFolderId(userId, subFolderNames.ekonomi, currentProjectFolderId),
                kma: await createAndGetFolderId(userId, subFolderNames.kma, currentProjectFolderId),
                media: await createAndGetFolderId(userId, subFolderNames.media, currentProjectFolderId),
            };

            // Uppdatera projektet i Firestore
            transaction.update(projectDocRef, {
                status: 'Pågående',
                projectNumber: projectNumberString,
                updatedAt: FieldValue.serverTimestamp(),
                'googleDrive.subFolderIds': subFolderIds
            });

            // Uppdatera användarens projektnummer-räknare
            transaction.update(userDocRef, { 
                projectCounter: nextProjectNumber 
            });

            return { success: true, projectNumber: projectNumberString };
        });

        console.log(`[Guldstandard] Anbud ${projectId} har befordrats till aktivt projekt med nummer: ${promotionResult.projectNumber}`);
        return promotionResult;

    } catch (error) {
        console.error("Fel vid befordran av anbud till projekt:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ett okänt serverfel uppstod.';
        return { success: false, error: errorMessage };
    }
}
