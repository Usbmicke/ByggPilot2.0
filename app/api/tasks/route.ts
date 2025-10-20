
import { NextResponse } from 'next/server';
import * as dal from '@/lib/data-access';
import logger from '@/lib/logger';

/**
 * GET-metod för att hämta uppgifter (Tasks) för ett specifikt projekt.
 * Anropar DAL för att säkerställa att användaren är autentiserad och har åtkomst till projektet.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    try {
        const tasks = await dal.getTasksForProject(projectId);
        return NextResponse.json({ tasks });
    } catch (error: any) {
        // DAL hanterar detaljerad loggning, här loggar vi kontexten för API-anropet.
        logger.error({ 
            projectId,
            error: error.message, 
            stack: error.stack 
        }, '[API /tasks GET] Failed to fetch tasks.');

        // Skicka ett generiskt felmeddelande till klienten.
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return NextResponse.json({ error: 'Internal Server Error' }, { status });
    }
}

/**
 * POST-metod för att skapa en ny uppgift (Task).
 * Anropar DAL som validerar indata och skapar uppgiften på ett säkert sätt.
 */
export async function POST(request: Request) {
    try {
        const { text, projectId } = await request.json();

        // DAL kommer att validera att text och projectId finns.
        const newTask = await dal.createTask({ text, projectId });

        return NextResponse.json(newTask, { status: 201 }); // 201 Created

    } catch (error: any) {
        logger.error({ 
            error: error.message, 
            stack: error.stack 
        }, '[API /tasks POST] Failed to create task.');

        const status = error.message === 'Unauthorized' ? 401 : (error.message.includes('required') ? 400 : 500);
        return NextResponse.json({ error: 'Internal Server Error' }, { status });
    }
}
