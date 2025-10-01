
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // GULDSTANDARD: Korrekt authOptions import
import { db } from "@/app/services/firestoreService'; // GULDSTANDARD: Korrekt, centraliserad DB-instans
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { MaterialCost } from "@/app/types/material";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  // GULDSTANDARD: Använd session.user.uid för konsekvens
  if (!session || !session.user || !session.user.uid) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }
  const userId = session.user.uid;

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new NextResponse(JSON.stringify({ message: 'Projekt-ID saknas.' }), { status: 400 });
  }

  try {
    // GULDSTANDARD: Verifiera ägarskap mot den nya databasstrukturen
    const projectDocRef = doc(db, 'users', userId, 'projects', projectId);
    const projectDoc = await getDoc(projectDocRef);
    if (!projectDoc.exists()) {
        return new NextResponse(JSON.stringify({ message: 'Åtkomst nekad till projektet.' }), { status: 403 });
    }

    // GULDSTANDARD: Hämta materialkostnader från sub-collection
    const materialCostsRef = collection(db, 'users', userId, 'projects', projectId, 'material-costs');
    const q = query(materialCostsRef, where("projectId", "==", projectId));

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
