
// Fil: app/api/time-entries/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // KORRIGERAD SÖKVÄG
import { adminDb } from "@/lib/admin"; // KORRIGERAD IMPORT
import { TimeEntry } from "@/types/index";
import { Timestamp } from 'firebase-admin/firestore'; // Importera Timestamp

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
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
    const projectRef = adminDb.collection('projects').doc(projectId); // KORRIGERAD
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists || projectDoc.data()?.userId !== session.user.id) {
        // Om projektet inte finns, eller om dess userId inte matchar den inloggade användaren, neka åtkomst.
        return new NextResponse(JSON.stringify({ message: 'Åtkomst nekad: Du äger inte detta projekt.' }), { status: 403 });
    }

    // Steg 3: Skapa tidrapporten (nu när vi vet att användaren har behörighet)
    const newTimeEntryRef = adminDb.collection('time-entries').doc(); // KORRIGERAD

    const newTimeEntry: Omit<TimeEntry, 'id'> = {
      userId: session.user.id,
      projectId,
      date: Timestamp.fromDate(new Date(date)), // Använd Timestamp
      hours,
      description,
      createdAt: Timestamp.now(), // Använd Timestamp
    };

    await newTimeEntryRef.set(newTimeEntry);

    return NextResponse.json({ id: newTimeEntryRef.id, ...newTimeEntry }, { status: 201 });

  } catch (error) {
    console.error('Error creating time entry:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid skapande av tidrapport.' }), { status: 500 });
  }
}
