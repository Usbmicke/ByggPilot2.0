
"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { adminDb, admin } from "@/lib/admin";
import { createFolder } from "@/services/driveService";

// HJÄLPFUNKTION: Hämtar hela sessionen, säkerställer autentisering och åtkomst till accessToken.
async function getAuthenticatedSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.accessToken) {
        throw new Error("Åtkomst nekad: Användaren är inte autentiserad eller sessionstoken saknas.");
    }
    return session;
}

// Steg 1: Uppdatera Företagsprofil
export async function updateCompanyProfile(formData: FormData) {
    try {
        const session = await getAuthenticatedSession();
        const userId = session.user.id;
        const companyName = formData.get("companyName") as string;
        if (!companyName) throw new Error("Företagsnamn är obligatoriskt.");

        const companyProfile = {
            companyName,
            orgnr: formData.get("orgnr") as string,
            streetAddress: formData.get("streetAddress") as string,
            postalCode: formData.get("postalCode") as string,
            city: formData.get("city") as string,
        };

        await adminDb.collection("users").doc(userId).update({
            ...companyProfile,
            onboardingStep: 1,
        });

        return { success: true, companyName };
    } catch (error: any) {
        console.error("Fel i updateCompanyProfile:", error);
        return { success: false, error: error.message };
    }
}

// Steg 2: Skapa Mappstruktur i Google Drive (med Rate Limiting)
export async function createDriveStructure(companyName: string) {
    const COOLDOWN_MINUTES = 5;
    try {
        const session = await getAuthenticatedSession();
        const userId = session.user.id;
        const accessToken = session.accessToken;

        const userDocRef = adminDb.collection("users").doc(userId);
        const userDoc = await userDocRef.get();
        const userData = userDoc.data();

        // RATE LIMITING-LOGIK
        if (userData?.driveStructureLastCreated) {
            const lastCreated = userData.driveStructureLastCreated.toDate();
            const now = new Date();
            const diffMinutes = (now.getTime() - lastCreated.getTime()) / (1000 * 60);

            if (diffMinutes < COOLDOWN_MINUTES) {
                throw new Error(`För att undvika dubbletter, vänta ${Math.ceil(COOLDOWN_MINUTES - diffMinutes)} minuter innan du försöker igen.`);
            }
        }

        // Huvudlogik
        const rootFolderName = `ByggPilot - ${companyName}`;
        // Skicka med accessToken till createFolder
        const rootFolderId = await createFolder(accessToken, rootFolderName);

        const subFolders = ["01 Projekt", "02 Kunder", "03 Offerer", "04 Fakturor", "05 Dokumentmallar", "06 Leverantörsfakturor"];
        // Skicka med accessToken till varje anrop
        await Promise.all(subFolders.map(folderName => createFolder(accessToken, folderName, rootFolderId)));

        // Uppdatera databasen med ID, steg och tidsstämpel för rate limiting
        await userDocRef.update({
            driveRootFolderId: rootFolderId,
            onboardingStep: 2,
            driveStructureLastCreated: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, driveFolderId: rootFolderId };
    } catch (error: any) {
        console.error("Fel i createDriveStructure:", error);
        return { success: false, error: error.message };
    }
}

// Steg 3: Uppdatera Standardpriser
export async function updateDefaultRates(formData: FormData) {
    try {
        const session = await getAuthenticatedSession();
        const userId = session.user.id;
        await adminDb.collection("users").doc(userId).update({
            defaultHourlyRate: formData.get('hourlyRate') as string,
            defaultMaterialMarkup: formData.get('materialMarkup') as string,
            onboardingStep: 3,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Fel i updateDefaultRates:", error);
        return { success: false, error: error.message };
    }
}

// Steg 4: Slutför Onboarding
export async function completeOnboarding() {
    try {
        const session = await getAuthenticatedSession();
        const userId = session.user.id;
        await adminDb.collection("users").doc(userId).update({
            onboardingComplete: true,
            onboardingStep: 4,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Fel i completeOnboarding:", error);
        return { success: false, error: error.message };
    }
}
