
import { NextResponse, NextRequest } from 'next/server';
import { collection, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { getSession } from '@/app/lib/session';
import { Project, ProjectStatus } from '@/app/types';

/**
 * Hämtar en lista över projekt.
 * Kan filtrera baserat på inloggad användare och valfritt på customerId.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    // Hämta query-parametrar från URL:en
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');

    // Bygg upp vår query dynamiskt
    const queryConstraints: QueryConstraint[] = [];
    queryConstraints.push(where('ownerId', '==', userId));

    if (customerId) {
      queryConstraints.push(where('customerId', '==', customerId));
    }

    const projectsQuery = query(collection(db, 'projects'), ...queryConstraints);
    const querySnapshot = await getDocs(projectsQuery);

    const projects: Project[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            customerId: data.customerId,
            customerName: data.customerName,
            status: data.status as ProjectStatus,
            driveFolderId: data.driveFolderId ?? null,
            address: data.address ?? null,
            lat: data.lat ?? undefined,
            lon: data.lon ?? undefined,
            progress: data.progress ?? 0,
            lastActivity: data.lastActivity?.toDate().toISOString() ?? new Date().toISOString(),
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
        };
    });

    return NextResponse.json(projects, { status: 200 });

  } catch (error) {
    console.error("Error fetching projects: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
