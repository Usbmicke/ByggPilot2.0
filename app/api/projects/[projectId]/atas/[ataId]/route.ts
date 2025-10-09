
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin as db } from '@/lib/admin';

// Definiera en typ för den förväntade inkommande datan i PUT-requesten
interface UpdateAtaPayload {
    description?: string;
    price?: number;
    status?: 'pending' | 'approved' | 'rejected';
    // Lägg till andra fält som kan uppdateras
}

/**
 * API-endpoint för att uppdatera ett specifikt ÄTA-dokument.
 * Hanterar PUT /api/projects/[projectId]/atas/[ataId]
 */
export async function PUT(request: Request, { params }: { params: { projectId: string, ataId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ message: 'Användaren är inte autentiserad.' }, { status: 401 });
        }

        const { projectId, ataId } = params;
        const body: UpdateAtaPayload = await request.json();

        // --- Validering (kan utökas) ---
        if (!projectId || !ataId) {
            return NextResponse.json({ message: 'Projekt-ID och ÄTA-ID krävs.' }, { status: 400 });
        }
        
        const { description, price, status } = body;
        if (!description && price === undefined && !status) {
             return NextResponse.json({ message: 'Ingen data att uppdatera.' }, { status: 400 });
        }

        // Hämta referens till dokumentet
        const ataRef = db.collection('atas').doc(ataId);
        const projectRef = db.collection('projects').doc(projectId);

        // Verifiera att dokumenten finns och att ÄTA tillhör projektet
        const [ataDoc, projectDoc] = await Promise.all([ataRef.get(), projectRef.get()]);

        if (!ataDoc.exists || !projectDoc.exists) {
            return NextResponse.json({ message: 'Kunde inte hitta angivet projekt eller ÄTA.' }, { status: 404 });
        }

        if (ataDoc.data()?.projectId !== projectId) {
            return NextResponse.json({ message: 'Denna ÄTA tillhör inte det angivna projektet.' }, { status: 403 }); // Forbidden
        }

        // Bygg uppdateringsobjektet med endast de fält som skickats med
        const updateData: Partial<UpdateAtaPayload> = {};
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (status !== undefined) updateData.status = status;

        // Utför uppdateringen i databasen
        await ataRef.update(updateData);

        return NextResponse.json({ message: 'ÄTA har uppdaterats.' }, { status: 200 });

    } catch (error) {
        console.error('Fel vid uppdatering av ÄTA:', error);
        return NextResponse.json({ message: 'Ett internt serverfel uppstod.' }, { status: 500 });
    }
}
