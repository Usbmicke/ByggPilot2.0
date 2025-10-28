
import { NextResponse } from 'next/server';
import { getActiveTimer } from '@/app/actions/timelogActions';

export async function GET(req: Request) {
  try {
    const result = await getActiveTimer();

    if (!result.success) {
      // Om autentisering misslyckas, vilket är det troligaste felet här från actionen
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Returnerar antingen den aktiva timern eller null
    return NextResponse.json({ activeTimer: result.data });

  } catch (error) {
    console.error("Error in active timer API route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
