
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/admin'; // KORRIGERAD: Använder nu den centraliserade adminDb-instansen.

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // KORRIGERAD: Bytte 'db' till 'adminDb' för att matcha den korrekta importen.
    const projectsSnapshot = await adminDb.collection('projects')
      .where('userId', '==', session.user.id)
      .orderBy('createdAt', 'desc')
      .get();

    if (projectsSnapshot.empty) {
      return NextResponse.json([]);
    }

    const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
