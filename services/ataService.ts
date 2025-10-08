
import { firestoreAdmin as db } from '@/app/lib/firebase-admin';
import { Ata } from '@/app/types'; // Återanvända vår typdefinition
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Hämtar ett enskilt ÄTA-dokument från Firestore.
 * Använder Admin SDK, så detta är endast för serversidan.
 * 
 * @param ataId ID på det ÄTA-dokument som ska hämtas.
 * @returns Ett ÄTA-objekt eller null om det inte hittades.
 */
export async function getAta(ataId: string): Promise<Ata | null> {
    try {
        const ataRef = db.collection('atas').doc(ataId);
        const doc = await ataRef.get();

        if (!doc.exists) {
            console.log(`Hittade ingen ÄTA med ID: ${ataId}`);
            return null;
        }

        const data = doc.data();
        if (!data) return null;

        // Konvertera Firestore Timestamp till ett Date-objekt
        const createdAt = (data.createdAt as Timestamp).toDate();

        // Returnera ett välformat Ata-objekt
        return {
            id: doc.id,
            projectId: data.projectId,
            description: data.description,
            price: data.price,
            status: data.status,
            createdAt: createdAt,
            // ... inkludera andra fält om de finns
        } as Ata;

    } catch (error) {
        console.error(`Fel vid hämtning av ÄTA ${ataId}:`, error);
        // Kasta om felet så att anropande funktion (t.ex. en Next.js-sida) kan hantera det.
        throw new Error('Kunde inte hämta ÄTA-data.');
    }
}
