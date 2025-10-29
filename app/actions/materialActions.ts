
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { firestoreAdmin } from '@/lib/config/firebase-admin'; 
import { Timestamp } from 'firebase-admin/firestore';
import { type Material } from '@/lib/types';

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
        
        const projectRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();

        if (!projectSnap.exists) {
            return { success: false, error: 'Åtkomst nekad.' };
        }

        
        const materialCostsCollectionRef = projectRef.collection('material-costs');
        const querySnapshot = await materialCostsCollectionRef.get();

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
                
                price: quantity * pricePerUnit,
                
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
