
// Fil: app/api/time-entries/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { TimeEntry } from "@/app/types/time"; // Importera vår nya datamodell

export async function POST(request: Request) {
  const session = await getServerSession(handler);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, date, hours, description } = body;

    // Validering
    if (!projectId || !date || hours === undefined || !description) {
      return new NextResponse(JSON.stringify({ message: 'Alla fält är obligatoriska.' }), { status: 400 });
    }
    if (typeof hours !== 'number' || hours <= 0) {
        return new NextResponse(JSON.stringify({ message: 'Antal timmar måste vara ett positivt tal.' }), { status: 400 });
    }

    const newTimeEntry: Omit<TimeEntry, 'id' | 'createdAt'> = {
      userId: session.user.id,
      projectId,
      date: new Date(date),
      hours,
      description,
    };

    // Skapa ett nytt dokument i 'time-entries' samlingen
    const docRef = await firestoreAdmin.collection('time-entries').add({
        ...newTimeEntry,
        createdAt: new Date(), // Lägg till serverns tidsstämpel
    });

    return NextResponse.json({ id: docRef.id, ...newTimeEntry }, { status: 201 });

  } catch (error) {
    console.error('Error creating time entry:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid skapande av tidrapport.' }), { status: 500 });
  }
}
