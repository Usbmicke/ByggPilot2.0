
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/lib/firebase/firestore';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { MaterialCost } from '@/app/types/index';

/**
 * GULDSTANDARD ACTION: `getMaterialCosts`
 * Hämtar alla materialkostnader för ett specifikt projekt.
 * Säkerställer att användaren äger projektet innan kostnaderna hämtas.
 */
export async function getMaterialCosts(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.uid;

    try {
        // Steg 1: Verifiera ägarskap av projektet
        const projectRef = doc(db, 'users', userId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) {
            return { success: false, error: 'Åtkomst nekad: Du äger inte detta projekt.' };
        }

        // Steg 2: Hämta materialkostnaderna från sub-collection
        const materialCostsCollectionRef = collection(projectRef, 'material-costs');
        const querySnapshot = await getDocs(materialCostsCollectionRef);

        const materialCosts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Firestore Timestamps måste konverteras till serialiserbara strängar
            date: doc.data().date.toDate().toISOString(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
        })) as MaterialCost[];

        return { success: true, data: materialCosts };

    } catch (error) {
        console.error('Fel vid hämtning av materialkostnader:', error);
        return { success: false, error: 'Ett serverfel uppstod vid hämtning av materialkostnader.' };
    }
}
