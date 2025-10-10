'use server';

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/admin";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { google } from 'googleapis';
import { getGoogleAuthClient } from "@/lib/google-server";

// =================================================================================
// GULDSTANDARD - ONBOARDING ACTIONS V5.1 (INKL. SKIP-LOGIK)
// =================================================================================

// Server Action för adress-sökning
export async function searchAddress(query: string) {
    if (!query) return { error: 'Sökfråga saknas' };
    try {
        const response = await fetch(`https://api.lantmateriet.se/geo/plats/v1/platsnamn/sok?namn=${encodeURIComponent(query)}&max-antal-svar=5`);
        if (!response.ok) return { error: `Fel från Lantmäteriet: ${response.status}` };
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { error: 'Internt serverfel vid adress-sökning.' };
    }
}

export async function updateCompanyProfile(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: 'Autentisering krävs.' };

    const companyData = {
        companyName: formData.get('companyName') as string,
        orgnr: formData.get('orgnr') as string,
        phone: formData.get('phone') as string,
        streetAddress: formData.get('streetAddress') as string,
        postalCode: formData.get('postalCode') as string,
        city: formData.get('city') as string,
    };

    try {
        const userRef = adminDb.collection('users').doc(session.user.id);
        await userRef.update({ company: companyData });
        revalidatePath('/onboarding');
        return { success: true };
    } catch (error) {
        console.error("Fel vid uppdatering av profil:", error);
        return { error: 'Kunde inte spara profilen.' };
    }
}

export async function createDriveStructure() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return { success: false, error: "Autentisering krävs." };
    }
    const userId = session.user.id;
    try {
        const auth = await getGoogleAuthClient(userId);
        const drive = google.drive({ version: 'v3', auth });

        const mainFolder = await drive.files.create({ requestBody: { name: 'ByggPilot', mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
        if (!mainFolder.data.id) throw new Error("Kunde inte skapa huvudmappen");

        const mainFolderId = mainFolder.data.id;
        const subfolders = ['Kunder', 'Projekt', 'Leverantörer', 'Personal', 'Bokföring', 'Dokumentmallar'];
        for (const folderName of subfolders) {
            await drive.files.create({ requestBody: { name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: [mainFolderId] } });
        }

        await adminDb.collection('users').doc(userId).update({
            driveStructureCreated: true,
            onboardingComplete: true,
        });

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error) {
        console.error(`Fel vid skapande av mappstruktur för ${userId}:`, error);
        return { success: false, error: 'Kunde inte skapa mappstrukturen i Google Drive. Verifiera dina Google Drive-behörigheter och försök igen.' };
    }
}

// NYTT: Funktion för att hoppa över onboarding
export async function skipOnboarding() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: "Autentisering krävs." };
    }
    const userId = session.user.id;
    try {
        // Sätter onboardingComplete till true för att undvika loopar
        await adminDb.collection('users').doc(userId).update({
            onboardingComplete: true,
        });
        revalidatePath('/dashboard'); // Säkerställer att dashboarden laddar om med rätt status
        return { success: true };
    } catch (error) {
        console.error(`Fel vid överhoppning av onboarding för ${userId}:`, error);
        return { success: false, error: "Kunde inte uppdatera användarstatus." };
    }
}
