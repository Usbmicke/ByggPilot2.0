
import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { listProjectsForUser, createProject } from '@/app/services/projectService';
import { Project } from '@/app/types';

/**
 * API-endpoint för att hämta alla projekt för en inloggad användare.
 * Metod: GET
 */
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const userId = session.user.id;
        const projects = await listProjectsForUser(userId);

        return NextResponse.json(projects);

    } catch (error) {
        console.error("Fel i API-endpointen [GET /api/projects]:", error);
        return NextResponse.json({ message: 'Ett internt serverfel uppstod' }, { status: 500 });
    }
}

/**
 * API-endpoint för att skapa ett nytt projekt.
 * Metod: POST
 */
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await request.json();
        const { name, customerName } = body;

        if (!name) {
            return NextResponse.json({ message: 'Projektnamn är obligatoriskt' }, { status: 400 });
        }

        // Förbered initial projektdata
        const newProjectData: Omit<Project, 'id'> = {
            name,
            customerName: customerName || '',
            status: 'Anbud', // Nya projekt startar som ett anbud/offert
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            userId: userId,
        };

        const createdProject = await createProject(newProjectData);

        return NextResponse.json(createdProject, { status: 201 }); // 201 Created

    } catch (error) {
        console.error("Fel i API-endpointen [POST /api/projects]:", error);
        return NextResponse.json({ message: 'Ett internt serverfel uppstod vid skapande av projekt' }, { status: 500 });
    }
}
