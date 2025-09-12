
import { NextResponse, NextRequest } from 'next/server';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { getServerSession } from '@/app/lib/auth'; // KORRIGERAD SÖKVÄG
import { TimeEntry } from '@/app/types';

/**
 * @swagger
 * /api/time-entries/list:
 *   get:
 *     summary: List time entries for a project
 *     tags:
 *       - Time Entries
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to fetch time entries for.
 *     responses:
 *       200:
 *         description: A list of time entries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimeEntry'
 *       401:
 *         description: Authentication required.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(); // KORRIGERAD FUNKTION
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return new NextResponse(JSON.stringify({ message: 'Project ID is required' }), { status: 400 });
    }

    // TODO: Add extra validation to ensure the user owns the project associated with the time entries

    const q = query(
      collection(db, 'timeEntries'),
      where('projectId', '==', projectId),
      orderBy('startTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const timeEntries: TimeEntry[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as TimeEntry));

    return NextResponse.json(timeEntries);

  } catch (error) {
    console.error("Error listing time entries:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
