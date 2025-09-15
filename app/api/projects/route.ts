
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/auth';
import { createProject } from '@/app/services/projectService';
import { Project, ProjectStatus } from '@/app/types';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const body = await request.json();
    const { name, customerId, customerName, status, address } = body;

    if (!name || !customerId || !status) {
      return new NextResponse(JSON.stringify({ message: 'Fälten name, customerId och status är obligatoriska' }), { status: 400 });
    }

    // Skapa ett projektobjekt som matchar den nya datamodellen
    // Använder Omit för att ta bort fält som inte ska skickas av klienten
    const projectData: Omit<Project, 'id' | 'createdAt' | 'lastActivity' | 'progress'> = {
      name,
      customerId,
      customerName: customerName || '', // Säkerställ att customerName är en sträng
      status,
      address: address || '',
      userId: session.user.id, // Korrekt fältnamn
    };

    const newProject = await createProject(projectData);

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/projects: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
