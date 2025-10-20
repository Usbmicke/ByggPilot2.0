
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/admin';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { TimeEntry } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return new NextResponse(JSON.stringify({ message: 'Project ID is required' }), { status: 400 });
    }

    // **SÄKERHETSÅTGÄRD: Verifiera att användaren äger projektet**
    const projectRef = adminDb.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists || projectSnap.data()?.userId !== session.user.id) {
        // Om projektet inte existerar, eller om ägaren inte matchar, neka åtkomst.
        // Vi returnerar 404 för att inte läcka information om att projektet existerar.
        return new NextResponse(JSON.stringify({ message: 'Project not found or access denied' }), { status: 404 });
    }

    // Nu är det säkert att hämta tidrapporterna
    const q = adminDb.collection('timeEntries')
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
