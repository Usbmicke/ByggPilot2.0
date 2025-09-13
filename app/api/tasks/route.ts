
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/services/firestoreService';
import { FieldValue } from 'firebase-admin/firestore';

// Hämta uppgifter för ett projekt
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    try {
        const tasksRef = db.collection('users').doc(session.user.id).collection('tasks').where('projectId', '==', projectId);
        const snapshot = await tasksRef.orderBy('createdAt', 'asc').get();

        if (snapshot.empty) {
            return NextResponse.json({ tasks: [] });
        }

        const tasks: any[] = [];
        snapshot.forEach(doc => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        return NextResponse.json({ tasks });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Skapa en ny uppgift
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { text, projectId } = await request.json();
        if (!text || !projectId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newTask = {
            text,
            projectId,
            completed: false,
            createdAt: FieldValue.serverTimestamp(),
            userId: session.user.id,
        };

        const newTaskRef = await db.collection('users').doc(session.user.id).collection('tasks').add(newTask);

        return NextResponse.json({ id: newTaskRef.id, ...newTask });

    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
