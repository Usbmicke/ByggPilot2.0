
// Fil: app/api/time-entries/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { TimeEntry } from "@/app/types/time";

export async function POST(request: Request) {
  const session = await getServerSession(handler);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, date, hours, description } = body;

    // Steg 1: Validering av indata
    if (!projectId || !date || hours === undefined || !description) {
      return new NextResponse(JSON.stringify({ message: 'Alla fält är obligatoriska.' }), { status: 400 });
    }
    if (typeof hours !== 'number' || hours <= 0) {
        return new NextResponse(JSON.stringify({ message: 'Antal timmar måste vara ett positivt tal.' }), { status: 400 });
    }

    // **STEG 2: KRITISK SÄKERHETSKONTROLL - Verifiera ägarskap av projektet**
    const projectRef = firestoreAdmin.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists() || projectDoc.data()?.userId !== session.user.id) {
        // Om projektet inte finns, eller om dess userId inte matchar den inloggade användaren, neka åtkomst.
        return new NextResponse(JSON.stringify({ message: 'Åtkomst nekad: Du äger inte detta projekt.' }), { status: 403 });
    }

    // Steg 3: Skapa tidrapporten (nu när vi vet att användaren har behörighet)
    const newTimeEntry: Omit<TimeEntry, 'id' | 'createdAt'> = {
      userId: session.user.id,
      projectId,
      date: new Date(date),
      hours,
      description,
    };

    const docRef = await firestoreAdmin.collection('time-entries').add({
        ...newTimeEntry,
        createdAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id, ...newTimeEntry }, { status: 201 });

  } catch (error) {
    console.error('Error creating time entry:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid skapande av tidrapport.' }), { status: 500 });
  }
}
