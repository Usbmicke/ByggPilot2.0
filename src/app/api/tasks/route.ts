
import { NextResponse } from 'next/server';
import { getTasks, createTask } from '@/app/actions/taskActions';

// Hämta uppgifter för ett projekt
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    try {
        const result = await getTasks(projectId);
        if (result.success) {
            return NextResponse.json({ tasks: result.data });
        } else {
            return NextResponse.json({ error: result.error }, { status: 403 });
        }
    } catch (error) {
        console.error('Error fetching tasks in API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Skapa en ny uppgift
export async function POST(request: Request) {
    try {
        const { projectId, text } = await request.json();

        if (!projectId || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await createTask(projectId, text);

        if (result.success) {
            // Notera: createdAt kommer vara en server-timestamp, inte ett Date-objekt här.
            // Klienten bör hantera detta om nödvändigt.
            return NextResponse.json(result.data);
        } else {
            return NextResponse.json({ error: result.error }, { status: 403 });
        }

    } catch (error) {
        console.error('Error creating task in API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
