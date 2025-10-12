
// Fil: app/api/time-entries/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/lib/admin";
import { TimeEntry } from "@/types/index";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new NextResponse(JSON.stringify({ message: 'Projekt-ID saknas.' }), { status: 400 });
  }

  try {
    const timeEntriesRef = firestoreAdmin.collection('time-entries');
    const q = timeEntriesRef
      .where('userId', '==', session.user.id)
      .where('projectId', '==', projectId)
      .orderBy('date', 'desc'); // Sortera med senaste först

    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const timeEntries = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Säkerställ att datum är i ISO-format för konsekvent hantering på klienten
            date: data.date.toDate().toISOString(), 
            createdAt: data.createdAt.toDate().toISOString(),
        } as TimeEntry;
    });

    return NextResponse.json(timeEntries, { status: 200 });

  } catch (error) {
    console.error('Error fetching time entries:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid hämtning av tidrapporter.' }), { status: 500 });
  }
}
