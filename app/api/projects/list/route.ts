
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { getSession } from '@/app/lib/session';
import { Project } from '@/app/types';

/**
 * Hämtar en lista över projekt som ägs av den för närvarande inloggade användaren.
 */
export async function GET() {
  try {
    // Steg 1: Hämta sessionen och verifiera att användaren är inloggad.
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    // Steg 2: Skapa en Firestore-fråga för att hämta projekt.
    // Frågan letar efter alla dokument i "projects"-samlingen där "ownerId" matchar den inloggade användarens ID.
    const projectsQuery = query(
      collection(db, 'projects'),
      where('ownerId', '==', userId)
    );

    // Steg 3: Exekvera frågan.
    const querySnapshot = await getDocs(projectsQuery);

    // Steg 4: Formatera resultaten.
    const projects: Project[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            customerName: data.customerName,
            status: data.status,
            driveFolderId: data.driveFolderId,
            // Säkerställ att tidsstämplar konverteras till ISO-strängar
            lastActivity: data.lastActivity?.toDate().toISOString() ?? new Date().toISOString(),
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
        };
    });

    // Steg 5: Returnera projektlistan som JSON.
    return NextResponse.json(projects, { status: 200 });

  } catch (error) {
    console.error("Error fetching projects: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
