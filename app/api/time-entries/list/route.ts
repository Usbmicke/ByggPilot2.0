
import { NextResponse, NextRequest } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { getServerSession } from '@/app/lib/auth';
import { TimeEntry } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return new NextResponse(JSON.stringify({ message: 'Project ID is required' }), { status: 400 });
    }

    // **SÄKERHETSÅTGÄRD: Verifiera att användaren äger projektet**
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists() || projectSnap.data().userId !== session.user.id) {
        // Om projektet inte existerar, eller om ägaren inte matchar, neka åtkomst.
        // Vi returnerar 404 för att inte läcka information om att projektet existerar.
        return new NextResponse(JSON.stringify({ message: 'Project not found or access denied' }), { status: 404 });
    }

    // Nu är det säkert att hämta tidrapporterna
    const q = query(
      collection(db, 'timeEntries'), // Korrekt collection name är 'timeEntries'
      where('projectId', '==', projectId),
      orderBy('date', 'desc') // Sorterar på 'date' istället för 'startTime' som inte finns i datamodellen
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
