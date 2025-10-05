
import { NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore as db } from '@/app/lib/firebase/server';
import { getNextProjectNumber } from '@/app/services/projectService'; // Assuming this service exists and works

export async function POST(request: Request) {
    const { customer, userId } = await request.json();

    if (!customer || !userId) {
        return new NextResponse('Kund-ID och Användar-ID krävs', { status: 400 });
    }

    try {
        const projectNumber = await getNextProjectNumber();
        const newProjectId = doc(db, 'projects', '__new__').id; // Generate a new unique ID
        const projectDocRef = doc(db, 'projects', newProjectId);

        const initialProjectData = {
            id: newProjectId,
            projectNumber,
            customer,
            ownerId: userId,
            status: 'offer', // Key status for this type of document
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            name: `Offert för ${customer.name}`,
            address: customer.address || '',
        };

        await setDoc(projectDocRef, initialProjectData);

        console.log(`[API] Offert-projekt skapat. ID: ${newProjectId}`);

        return NextResponse.json({ projectId: newProjectId });

    } catch (error) {
        console.error("[API] Fel vid skapande av offert-projekt:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new NextResponse(JSON.stringify({ error: 'Internt serverfel', details: errorMessage }), { status: 500 });
    }
}
