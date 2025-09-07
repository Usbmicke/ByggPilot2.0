
import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { getSession } from '@/app/lib/session';
import { TimeEntry } from '@/app/types';

export async function POST(request: Request) {
  try {
    // Steg 1: Hämta sessionen och verifiera att användaren är inloggad.
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const body = await request.json();
    const { projectId, projectName, customerName, date, hours, comment } = body;

    // Steg 2: Validera inkommande data
    if (!projectId || !projectName || !customerName || !date || hours === undefined) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    if (typeof hours !== 'number' || hours <= 0) {
        return new NextResponse(JSON.stringify({ message: 'Hours must be a positive number' }), { status: 400 });
    }

    // Steg 3: Skapa tidsposten i Firestore
    const docRef = await addDoc(collection(db, "time_entries"), {
      userId,
      projectId,
      projectName,
      customerName,
      date, 
      hours,
      comment: comment || '',
      createdAt: serverTimestamp(),
    });

    // Steg 4: Returnera det skapade objektet
    const newTimeEntry: Partial<TimeEntry> = {
        id: docRef.id,
        userId,
        projectId,
        projectName,
        customerName,
        date,
        hours,
        comment,
    };

    return NextResponse.json(newTimeEntry, { status: 201 });

  } catch (error) {
    console.error("Error creating time entry: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}`}), { status: 500 });
  }
}
