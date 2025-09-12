
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from '@/app/lib/auth';
import { listProjects } from '@/app/services/projectService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId') || undefined;

    const projects = await listProjects(session.user.id, customerId);

    return NextResponse.json(projects, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/projects/list: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
