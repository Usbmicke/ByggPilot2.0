
import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/dal/repositories/user.repo';

// API route to securely fetch user data by UID.
export async function GET(request: Request, { params }: { params: { uid: string } }) {
  try {
    const uid = params.uid;
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await getUserById(uid);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return only the necessary, non-sensitive fields to the client
    const { hasOnboarded, email, name, companyName, logoUrl } = user;
    return NextResponse.json({ hasOnboarded, email, name, companyName, logoUrl });

  } catch (error) {
    console.error(`[API /user/[uid]] Error fetching user:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
