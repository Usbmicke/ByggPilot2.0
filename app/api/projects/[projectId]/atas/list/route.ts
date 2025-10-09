
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from '@/lib/admin';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.projectId;

    try {
        // Säkerhetskontroll: Verifiera att projektet tillhör den inloggade användaren
        const projectRef = firestoreAdmin.collection('projects').doc(projectId);
        const projectDoc = await projectRef.get();

        if (!projectDoc.exists) {
            return NextResponse.json({ error: 'Projektet hittades inte.' }, { status: 404 });
        }

        const projectData = projectDoc.data();
        if (projectData?.userId !== userId) {
            return NextResponse.json({ error: 'Användaren har inte behörighet till detta projekt.' }, { status: 403 });
        }

        // Hämta alla ÄTA-dokument från sub-kollektionen
        const atasRef = projectRef.collection('atas').orderBy('createdAt', 'desc');
        const snapshot = await atasRef.get();

        if (snapshot.empty) {
            return NextResponse.json({ atas: [] });
        }

        const atas: any[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Konvertera Timestamps till ISO-strängar för serialisering
            const serializedData = {
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
                updatedAt: data.updatedAt.toDate().toISOString(),
            };
            atas.push({ id: doc.id, ...serializedData });
        });

        return NextResponse.json({ atas });

    } catch (error) {
        console.error('Error fetching ATAs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
