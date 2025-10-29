
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { createProjectFolderStructure } from '@/app/actions/driveActions';

// VÄRLDSKLASS-ARKITEKTUR: En dedikerad åtgärd för att spara onboarding-data.
export async function saveOnboardingData(data: { companyName: string; companyVision?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering misslyckades.' };
    }
    const userId = session.user.id;

    try {
        await firestoreAdmin.collection('users').doc(userId).update({
            companyName: data.companyName,
            companyVision: data.companyVision || '',
            onboardingComplete: false, // Markeras inte som slutförd än
        });
        return { success: true };
    } catch (error: any) {
        console.error('Fel vid sparande av onboarding-data:', error);
        return { success: false, error: error.message };
    }
}

// VÄRLDSKLASS-ARKITEKTUR: En dedikerad åtgärd för att skapa onboarding-projektet.
export async function createOnboardingProject() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) { // VÄRLDSKLASS-TILLÄGG: Säkerställer att email finns.
        return { success: false, error: 'Autentisering misslyckades eller användar-e-post saknas.' };
    }
    const userId = session.user.id;

    // Hämta företagsnamn från användarprofilen
    const userDoc = await firestoreAdmin.collection('users').doc(userId).get();
    const companyName = userDoc.data()?.companyName || 'Mitt Första Företag';
    const projectName = `Onboarding-projekt för ${companyName}`;

    try {
        // Skapa mappstrukturen i Google Drive
        const driveResult = await createProjectFolderStructure(userId, projectName);
        if (!driveResult.success) {
            throw new Error(driveResult.error || 'Okänt fel vid skapande av mappstruktur i Drive.');
        }

        // Skapa projektet i Firestore
        const projectRef = firestoreAdmin.collection('projects').doc();
        await projectRef.set({
            projectName: projectName,
            userId: userId,
            status: 'In Progress',
            createdAt: new Date(),
            // VÄRLDSKLASS-TILLÄGG: Inkluderar ID för huvudmappen från Drive
            googleDriveFolderId: driveResult.projectFolderId,
        });

        // Markera onboarding som slutförd för användaren
        await firestoreAdmin.collection('users').doc(userId).update({ onboardingComplete: true });

        return { success: true, projectId: projectRef.id };

    } catch (error: any) {
        console.error('Fel i createOnboardingProject:', error);
        return { success: false, error: error.message };
    }
}
