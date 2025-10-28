
import { NextResponse } from 'next/server';
import { startTimer, stopTimer } from '@/app/actions/timelogActions';

// POST: Starta en ny timer
export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: 'ProjectId is required' }, { status: 400 });
    }

    const result = await startTimer(projectId);

    if (result.success) {
      return NextResponse.json({ success: true, ...result.data });
    } else {
      // Anta 401 för autentiseringsfel, annars 500
      const status = result.error === 'Autentisering krävs.' ? 401 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

  } catch (error) {
    console.error("Error in start timer API route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Stoppa en pågående timer
export async function PUT(req: Request) {
    try {
        const result = await stopTimer();

        if (result.success) {
            return NextResponse.json({ success: true, ...result.data });
        } else {
            // Hantera olika felscenarier
            const status = result.error === 'Autentisering krävs.' ? 401 
                         : result.error === 'Ingen aktiv timer att stoppa.' ? 404 
                         : 500;
            return NextResponse.json({ error: result.error }, { status });
        }

    } catch (error) {
        console.error("Error in stop timer API route:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
