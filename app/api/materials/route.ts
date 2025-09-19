
// Fil: app/api/materials/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { MaterialCost } from "@/app/types/material";

export async function GET(request: Request) {
  const session = await getServerSession(handler);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new NextResponse(JSON.stringify({ message: 'Projekt-ID saknas.' }), { status: 400 });
  }

  try {
    // Verifiera att projektet tillhör den inloggade användaren
    const projectDoc = await firestoreAdmin.collection('projects').doc(projectId).get();
    if (!projectDoc.exists || projectDoc.data()?.userId !== session.user.id) {
        return new NextResponse(JSON.stringify({ message: 'Åtkomst nekad till projektet.' }), { status: 403 });
    }

    const materialCostsRef = firestoreAdmin.collection('material-costs');
    const q = materialCostsRef
      .where('projectId', '==', projectId)
      .orderBy('date', 'desc'); // Sortera med senaste först

    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const materialCosts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(), 
            createdAt: data.createdAt.toDate().toISOString(),
        } as MaterialCost;
    });

    return NextResponse.json(materialCosts, { status: 200 });

  } catch (error) {
    console.error('Error fetching material costs:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid hämtning av materialkostnader.' }), { status: 500 });
  }
}
