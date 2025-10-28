
import { NextResponse } from 'next/server';
import { getMaterialCosts } from '@/app/actions/materialActions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new NextResponse(JSON.stringify({ message: 'Projekt-ID saknas.' }), { status: 400 });
  }

  try {
    const result = await getMaterialCosts(projectId);

    if (!result.success) {
      return new NextResponse(JSON.stringify({ message: result.error }), { status: 403 });
    }

    return NextResponse.json(result.data, { status: 200 });

  } catch (error) {
    console.error('Error in API route for material costs:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel.' }), { status: 500 });
  }
}
