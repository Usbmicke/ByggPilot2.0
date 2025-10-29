
'use server';

import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { Material } from "@/app/types/index";
import { Timestamp } from 'firebase-admin/firestore';

/**
 * GULDSTANDARD DAL-FUNKTION: createMaterialInDb
 * Skapar ett nytt material-dokument i Firestore under rätt projekt.
 * @param userId - ID för den autentiserade användaren.
 * @param projectId - ID för projektet som materialet tillhör.
 * @param materialData - Data för det nya materialet (utan id, pris, datum).
 * @returns Det fullständiga Material-objektet inklusive det nya ID:t.
 */
export async function createMaterialInDb(
    userId: string,
    projectId: string, 
    materialData: Omit<Material, 'id' | 'price' | 'date' | 'projectId'>
): Promise<Material> {
    
    const { name, quantity, pricePerUnit, unit, supplier } = materialData;

    const projectDocRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);
    const projectDoc = await projectDocRef.get();

    if (!projectDoc.exists) {
        throw new Error('Projektet hittades inte eller så saknas behörighet.');
    }

    const newMaterialCostRef = projectDocRef.collection('material-costs').doc();

    const newMaterial: Omit<Material, 'id'> = {
        projectId,
        name,
        quantity,
        unit,
        pricePerUnit,
        supplier: supplier || undefined,
        price: quantity * pricePerUnit,
        date: Timestamp.now(),
    };

    await newMaterialCostRef.set(newMaterial);

    const result: Material = {
        id: newMaterialCostRef.id,
        ...newMaterial,
    };

    return result;
}
