
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/authOptions';
import { db } from '@/app/lib/firebase/firestore';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Material } from '@/app/types/index';

/**
 * GULDSTANDARD ACTION: `getMaterialCosts`
 * Hämtar alla materialkostnader för ett specifikt projekt.
 * VÄRLDSKLASS-KORRIGERING: Mappar den inaktuella databas-strukturen till den 
 * korrekta `Material`-typen från `app/types/index.ts`.
 * Detta säkerställer typsäkerhet och undviker "mismatch"-fel.
 */
export async function getMaterialCosts(projectId: string): Promise<{ success: boolean; data?: Material[]; error?: string; }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: 'Autentisering krävs.' };
    }
    const userId = session.user.id;

    try {
        // Steg 1: Verifiera ägarskap (ingen ändring här)
        const projectRef = doc(db, 'users', userId, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) {
            return { success: false, error: 'Åtkomst nekad: Du äger inte detta projekt.' };
        }

        // Steg 2: Hämta materialkostnaderna
        const materialCostsCollectionRef = collection(projectRef, 'material-costs');
        const querySnapshot = await getDocs(materialCostsCollectionRef);

        // Steg 3: Korrekt mappning från Firestore-data till Material-typ
        const materialCosts: Material[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            
            // Skapa ett nytt, typsäkert objekt
            return {
                id: doc.id,
                projectId: projectId, // Lägg till projectId som krävs av typen
                name: data.name || 'Okänt material', // Ge standardvärden för säkerhets skull
                quantity: data.quantity || 1, // Anta 1 om kvantitet saknas
                unit: data.unit || 'st', // Anta 'st' om enhet saknas
                pricePerUnit: data.price || data.pricePerUnit || 0, // Hantera både gamla (`price`) och nya (`pricePerUnit`) fält
                supplier: data.supplier || undefined, // Valfritt fält
            };
        });

        return { success: true, data: materialCosts };

    } catch (error) {
        console.error('Fel vid hämtning av materialkostnader:', error);
        return { success: false, error: 'Ett serverfel uppstod vid hämtning av materialkostnader.' };
    }
}
