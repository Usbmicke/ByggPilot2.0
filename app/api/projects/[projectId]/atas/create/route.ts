
import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { z } from 'zod';
import { firestoreAdmin } from '@/app/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const createAtaSchema = z.object({
    projectId: z.string().nonempty("Projekt-ID måste anges"),
    title: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.projectId;

    try {
        const json = await request.json();
        // Injicera projectId från URL:en i objektet som ska valideras
        const body = createAtaSchema.parse({ ...json, projectId });

        // Säkerhetskontroll: Verifiera att projektet tillhör den inloggade användaren
        const projectRef = firestoreAdmin.collection('projects').doc(body.projectId);
        const projectDoc = await projectRef.get();

        if (!projectDoc.exists) {
            return NextResponse.json({ error: 'Projektet hittades inte.' }, { status: 404 });
        }

        const projectData = projectDoc.data();
        if (projectData?.userId !== userId) {
            return NextResponse.json({ error: 'Användaren har inte behörighet till detta projekt.' }, { status: 403 });
        }
        
        // Skapa den nya ÄTA:n i en sub-kollektion under projektet
        const newAtaRef = projectRef.collection('atas').doc();

        const newAtaData = {
            title: body.title || 'Namnlös ÄTA',
            notes: body.notes || '',
            status: 'DRAFT',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        await newAtaRef.set(newAtaData);

        const createdAta = {
            id: newAtaRef.id,
            ...newAtaData
        };
        
        console.log('--- Nytt ÄTA-utkast sparat i Firestore ---');
        console.log('Projekt ID:', body.projectId);
        console.log('ÄTA ID:', newAtaRef.id);
        console.log('------------------------------------------');

        return NextResponse.json(createdAta, { status: 201 }); // 201 Created

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
        }
        console.error('Error creating ATA draft:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
