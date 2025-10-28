
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/lib/firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { Calculation } from '@/app/types/index';

/**
 * GULDSTANDARD ACTION: `getCalculation`
 * Hämtar kalkyl-data för ett specifikt projekt.
 * Säkerställer att användaren äger projektet innan data hämtas.
 */
export async function getCalculation(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.uid;

    try {
        // Steg 1: Verifiera ägarskap av projektet (implicit genom sökvägen)
        const calcDocRef = doc(db, 'users', userId, 'projects', projectId, 'calculations', 'main');
        const calculationDoc = await getDoc(calcDocRef);

        if (!calculationDoc.exists()) {
            return { success: false, error: 'Kalkyl-data kunde inte hittas för projektet.' };
        }

        const calculation = calculationDoc.data() as Calculation;

        return { success: true, data: calculation };

    } catch (error) {
        console.error('Fel vid hämtning av kalkyl-data:', error);
        return { success: false, error: 'Ett serverfel uppstod vid hämtning av kalkyl-data.' };
    }
}
