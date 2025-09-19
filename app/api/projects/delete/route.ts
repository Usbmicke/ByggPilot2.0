
// Fil: app/api/projects/delete/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";

// Helper-funktion för att ta bort dokument i en collection baserat på projectId
async function deleteCollection(collectionName: string, projectId: string, batch: FirebaseFirestore.WriteBatch) {
    const collectionRef = firestoreAdmin.collection(collectionName);
    const q = collectionRef.where('projectId', '==', projectId);
    const snapshot = await q.get();
    
    if (!snapshot.empty) {
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
    }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(handler);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  const { projectId } = await request.json();

  if (!projectId) {
    return new NextResponse(JSON.stringify({ message: 'Projekt-ID saknas.' }), { status: 400 });
  }

  try {
    const projectRef = firestoreAdmin.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    // Säkerhetskontroll: Äger användaren detta projekt?
    if (!projectDoc.exists || projectDoc.data()?.userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ message: 'Åtkomst nekad.' }), { status: 403 });
    }

    // Starta en batch-operation för att säkerställa atomicitet
    const batch = firestoreAdmin.batch();

    // 1. Ta bort alla associerade tidrapporter
    await deleteCollection('time-entries', projectId, batch);

    // 2. Ta bort alla associerade materialkostnader
    await deleteCollection('material-costs', projectId, batch);

    // 3. Ta bort själva projektet
    batch.delete(projectRef);

    // Genomför alla operationer i batchen
    await batch.commit();

    return NextResponse.json({ message: 'Projektet och all tillhörande data har tagits bort.' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting project:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid borttagning av projekt.' }), { status: 500 });
  }
}
