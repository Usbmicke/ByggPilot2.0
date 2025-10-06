
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// KORRIGERAD IMPORT: Pekar nu mot den enda sanningskällan för authOptions.
import { authOptions } from '@/lib/auth';
import { db } from '@/services/firestoreService';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const projectsRef = db.collection('users').doc(session.user.id).collection('projects');
        const snapshot = await projectsRef.orderBy('createdAt', 'desc').get();

        if (snapshot.empty) {
            return NextResponse.json({ projects: [] });
        }

        const projects: any[] = [];
        snapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });

        return NextResponse.json({ projects });

    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
