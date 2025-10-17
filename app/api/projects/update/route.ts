
// Fil: app/api/projects/update/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // KORRIGERAD SÖKVÄG
import { adminDb } from "@/lib/admin"; // KORRIGERAD IMPORT
import { Timestamp } from 'firebase-admin/firestore';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  const { projectId, projectName, clientName, hourlyRate, status } = await request.json();

  // Validering
  if (!projectId || !projectName || !clientName || !hourlyRate || !status) {
    return new NextResponse(JSON.stringify({ message: 'Nödvändig information saknas.' }), { status: 400 });
  }
  if (typeof hourlyRate !== 'number' || hourlyRate <= 0) {
    return new NextResponse(JSON.stringify({ message: 'Timpriset måste vara ett positivt tal.' }), { status: 400 });
  }

  try {
    const projectRef = adminDb.collection('projects').doc(projectId); // KORRIGERAD
    const projectDoc = await projectRef.get();

    // Säkerhetskontroll: Äger användaren detta projekt?
    if (!projectDoc.exists || projectDoc.data()?.userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ message: 'Åtkomst nekad.' }), { status: 403 });
    }

    const updateData = {
      projectName,
      clientName,
      hourlyRate,
      status,
      updatedAt: Timestamp.now(),
    };

    await projectRef.update(updateData);

    return NextResponse.json({ message: 'Projektet har uppdaterats.' }, { status: 200 });

  } catch (error) {
    console.error('Error updating project:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid uppdatering av projekt.' }), { status: 500 });
  }
}
