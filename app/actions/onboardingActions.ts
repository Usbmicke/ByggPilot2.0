
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/admin';
import { getGoogleAuthClient } from '@/lib/google-server';
import { google } from 'googleapis';
import { z } from 'zod';

// =================================================================================
// GULDSTANDARD - ONBOARDING ACTIONS V5.0 (FULLSTÄNDIG MAPPSTRUKTUR)
// REVIDERING: Implementerar den fullständiga, ISO-inspirerade mappstrukturen
// från den gamla API-routen och returnerar rotmappens ID för länkning.
// =================================================================================

const companyProfileSchema = z.object({
    companyName: z.string().min(2),
    orgnr: z.string().optional(),
    phone: z.string().optional(),
    streetAddress: z.string().min(2),
    postalCode: z.string().min(5).max(5),
    city: z.string().min(2),
});

// Helper för att skapa undermappar
async function createSubFolder(drive: any, name: string, parentId: string) {
    console.log(`[Drive] ...skapar undermapp '${name}'...`);
    await drive.files.create({
        requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
        },
        fields: 'id',
    });
}

async function createFolderAndGetId(drive: any, name: string, parentId: string): Promise<string> {
    console.log(`[Drive] ...skapar undermapp '${name}'...`);
    const res = await drive.files.create({
        requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
        },
        fields: 'id',
    });
    if (!res.data.id) throw new Error(`Kunde inte skapa undermapp: ${name}`);
    return res.data.id;
}

export async function updateCompanyProfile(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' };
    const rawData = Object.fromEntries(formData.entries());
    const parsed = companyProfileSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: 'Validering misslyckades.' };
    try {
        await adminDb.collection('users').doc(session.user.id).update({ companyProfile: parsed.data, onboardingStep: 1 });
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Kunde inte uppdatera företagsprofil.' };
    }
}

export async function createDriveStructure(): Promise<{ success: boolean; error?: string; driveFolderId?: string }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' };
    const userId = session.user.id;

    try {
        console.log(`[Drive] Användare ${userId}: Startar processen för att skapa FULLSTÄNDIG mappstruktur.`);

        const userDocRef = adminDb.collection('users').doc(userId);
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) throw new Error('Användardokumentet kunde inte hittas.');
        const companyName = userDoc.data()?.companyProfile?.companyName;
        if (!companyName) throw new Error('Företagsnamn saknas i profilen.');
        
        const auth = await getGoogleAuthClient(userId);
        const drive = google.drive({ version: 'v3', auth });
        
        const rootFolderName = `ByggPilot - ${companyName}`;
        console.log(`[Drive] Användare ${userId}: Skapar rotmapp '${rootFolderName}'...`);
        const rootFolderRes = await drive.files.create({
            requestBody: { name: rootFolderName, mimeType: 'application/vnd.google-apps.folder' },
            fields: 'id',
        });
        const rootFolderId = rootFolderRes.data.id;
        if (!rootFolderId) throw new Error('Kunde inte skapa rotmappen.');
        console.log(`[Drive] Användare ${userId}: Rotmapp skapad med ID: ${rootFolderId}. Skapar nu undermappar...`);

        // Skapa huvudmappar
        await createSubFolder(drive, '00_Företagsmallar', rootFolderId);
        await createSubFolder(drive, '01_Kunder & Anbud', rootFolderId);
        await createSubFolder(drive, '02_Pågående Projekt', rootFolderId);
        await createSubFolder(drive, '03_Avslutade Projekt', rootFolderId);
        const ekonomiFolderId = await createFolderAndGetId(drive, '04_Företagsekonomi', rootFolderId);
        
        // Skapa undermappar till Företagsekonomi
        await createSubFolder(drive, 'Körjournaler', ekonomiFolderId);
        await createSubFolder(drive, 'Leverantörsfakturor (Ej projektspecifika)', ekonomiFolderId);

        console.log(`[Drive] Användare ${userId}: Fullständig mappstruktur skapad.`);
        
        await adminDb.collection('users').doc(userId).update({
            onboardingComplete: true,
            driveRootFolderId: rootFolderId
        });
        console.log(`[Drive] Användare ${userId}: Firestore uppdaterad. Processen är slutförd.`);

        // Returnera ID:t för den nya knappen
        return { success: true, driveFolderId: rootFolderId };

    } catch (error) {
        console.error(`[Drive] Användare ${userId}: Allvarligt fel vid skapande av mappstruktur:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Ett okänt fel inträffade.';
        return { success: false, error: `Kunde inte skapa mappstruktur. Detaljer: ${errorMessage}` };
    }
}

export async function skipOnboarding() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' };
    try {
        await adminDb.collection('users').doc(session.user.id).update({ onboardingComplete: true });
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update user' };
    }
}

export async function searchAddress(query: string) {
    if (query.length < 2) return { success: false, data: [] };
    try {
        const response = await fetch(`https://api.lantmateriet.se/geo/platsnamn/v1/platsnamn?q=${query}&fuzzy=true`);
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'API search failed' };
    }
}

export async function triggerSessionUpdate() {
    // Denna funktion är avsiktligt tom. Klientens anrop till denna via
    // en server-åtgärd i samband med useSession().update() är det som
    // får NextAuth att uppdatera session-cookien.
    return { success: true };
}
