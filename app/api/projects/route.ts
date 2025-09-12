
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/auth';
import { createProject } from '@/app/services/projectService';
import { ProjectStatus } from '@/app/types';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const { name, customerId, customerName, status } = await request.json() as { name: string, customerId: string, customerName: string, status: ProjectStatus };

    if (!name || !customerId || !customerName || !status) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const newProject = await createProject({
      name,
      customerId,
      customerName,
      status,
      ownerId: session.user.id,
    });

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/projects: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
