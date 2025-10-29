
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { db } from '@/lib/config/firebase-admin';
import { collection, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { Material } from '@/app/types/index';

/**
 * GULDSTANDARD ACTION: `getMaterialCosts`
 * Hämtar alla materialkostnader för ett specifikt projekt.
 * VÄRLDSKLASS-KORRIGERING: Mappar den inaktuella databas-strukturen till den 
 * korrekta `Material`-typen, inklusive beräkning av totalpris och tillägg av datum.
 */
export async function getMaterialCosts(projectId: string): Promise<{ success: boolean; data?: Material[]; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        const projectRef = doc(db, 'users', userId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) {
            return { success: false, error: 'Åtkomst nekad.' };
        }

        const materialCostsCollectionRef = collection(projectRef, 'material-costs');
        const querySnapshot = await getDocs(materialCostsCollectionRef);

        const materialCosts: Material[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const quantity = data.quantity || 0;
            const pricePerUnit = data.pricePerUnit || data.price || 0; // Hantera gamla fält
            
            return {
                id: doc.id,
                projectId: projectId,
                name: data.name || 'Okänt material',
                quantity: quantity,
                unit: data.unit || 'st',
                pricePerUnit: pricePerUnit,
                // VÄRLDSKLASS-KORRIGERING: Beräkna totalpris
                price: quantity * pricePerUnit,
                // VÄRLDSKLASS-KORRIGERING: Lägg till ett datum. Använder Firestore Timestamp.
                date: data.date || Timestamp.now(), 
                supplier: data.supplier || undefined,
            };
        });

        return { success: true, data: materialCosts };

    } catch (error) {
        console.error('Fel vid hämtning av materialkostnader:', error);
        return { success: false, error: 'Ett serverfel uppstod.' };
    }
}
