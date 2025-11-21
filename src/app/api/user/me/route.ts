import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, getMyProfile } from '@/app/_lib/dal/dal';

export async function GET(request: NextRequest) {
  try {
    // Logic confirmed by diagnostics: await is mandatory
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      // This is an expected condition for unauthenticated users.
      throw new Error("Session cookie not found.");
    }

    // Follow the Golden Standard flow
    const session = await verifySession(sessionCookie);
    const userProfile = await getMyProfile(session);

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found in database.' }, { status: 404 });
    }

    return NextResponse.json(userProfile, { status: 200 });

  } catch (error: any) {
    // Log the actual error for server-side debugging
    console.error(`[API /api/user/me] Auth Error: ${error.message}`);
    // Return a generic error to the client
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
