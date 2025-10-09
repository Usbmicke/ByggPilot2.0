
import { NextResponse, NextRequest } from 'next/server';
import { firestoreAdmin } from '@/lib/admin';
import { getServerSession } from "next-auth/next";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { TimeEntry } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(handler);
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return new NextResponse(JSON.stringify({ message: 'Project ID is required' }), { status: 400 });
    }

    // **SÄKERHETSÅTGÄRD: Verifiera att användaren äger projektet**
    const projectRef = firestoreAdmin.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists || projectSnap.data()?.userId !== session.user.id) {
        // Om projektet inte existerar, eller om ägaren inte matchar, neka åtkomst.
        // Vi returnerar 404 för att inte läcka information om att projektet existerar.
        return new NextResponse(JSON.stringify({ message: 'Project not found or access denied' }), { status: 404 });
    }

    // Nu är det säkert att hämta tidrapporterna
    const q = firestoreAdmin.collection('timeEntries')
      .where('projectId', '==', projectId)
      .orderBy('date', 'desc');

    const querySnapshot = await q.get();
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
