
"use server";

import { auth } from "@/lib/auth";
import { adminDb, admin } from "@/lib/admin"; // Importera admin för Timestamp
import { createFolder } from "@/services/driveService";

// Återanvändbar funktion för att hämta användar-ID, säkerställer autentisering
async function getAuthenticatedUserId() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error("Åtkomst nekad: Användaren är inte autentiserad.");
    }
    return userId;
}

// Funktion för att hämta användardokumentet
async function getUserDocument(userId: string) {
    return await adminDb.collection('users').doc(userId).get();
}

// Steg 1: Uppdatera Företagsprofil
export async function updateCompanyProfile(formData: FormData) {
    try {
        const userId = await getAuthenticatedUserId();
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
        const userId = await getAuthenticatedUserId();
        const userDoc = await getUserDocument(userId);
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
        const rootFolderId = await createFolder(userId, rootFolderName);

        const subFolders = ["01 Projekt", "02 Kunder", "03 Offerer", "04 Fakturor", "05 Dokumentmallar", "06 Leverantörsfakturor"];
        await Promise.all(subFolders.map(folderName => createFolder(userId, folderName, rootFolderId)));

        // Uppdatera databasen med ID, steg och tidsstämpel för rate limiting
        await adminDb.collection("users").doc(userId).update({
            driveRootFolderId: rootFolderId,
            onboardingStep: 2,
            driveStructureLastCreated: admin.firestore.FieldValue.serverTimestamp(), // Sätt tidsstämpeln
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
        const userId = await getAuthenticatedUserId();
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
        const userId = await getAuthenticatedUserId();
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
