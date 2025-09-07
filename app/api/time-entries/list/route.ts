
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { getSession } from '@/app/lib/session';
import { TimeEntry } from '@/app/types';

/**
 * Hämtar en lista över tidsposter som ägs av den för närvarande inloggade användaren,
 * sorterade efter datum i fallande ordning.
 */
export async function GET() {
  try {
    // Steg 1: Hämta sessionen och verifiera användaren.
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    // Steg 2: Skapa en Firestore-fråga för att hämta tidsposter.
    // Frågan sorterar resultaten efter "date" för att visa de senaste posterna först.
    const timeEntriesQuery = query(
      collection(db, 'time-entries'),
      where('ownerId', '==', userId),
      orderBy('date', 'desc') // Nyaste först
    );

    // Steg 3: Exekvera frågan.
    const querySnapshot = await getDocs(timeEntriesQuery);

    // Steg 4: Formatera resultaten.
    const timeEntries: TimeEntry[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            projectId: data.projectId,
            projectName: data.projectName,
            customerName: data.customerName,
            date: data.date, 
            hours: data.hours,
            comment: data.comment,
            // Konvertera Firestore Timestamp till ISO-sträng om den finns
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
        };
    });

    // Steg 5: Returnera tidsposterna som JSON.
    return NextResponse.json(timeEntries, { status: 200 });

  } catch (error) {
    console.error("Error fetching time entries: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
