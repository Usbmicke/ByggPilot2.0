
// Fil: app/api/projects/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { Timestamp } from 'firebase-admin/firestore';
import { Project } from "@/app/types/project";

export async function POST(request: Request) {
  const session = await getServerSession(handler);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  const { projectName, clientName, hourlyRate, status } = await request.json();

  // Validering
  if (!projectName || !clientName || !hourlyRate || !status) {
    return new NextResponse(JSON.stringify({ message: 'Nödvändig information saknas.' }), { status: 400 });
  }
  if (typeof hourlyRate !== 'number' || hourlyRate <= 0) {
    return new NextResponse(JSON.stringify({ message: 'Timpriset måste vara ett positivt tal.' }), { status: 400 });
  }

  try {
    const userId = session.user.id;
    const userCounterRef = firestoreAdmin.collection('user-counters').doc(userId);

    // Atomisk transaktion för att få nästa projektnummer
    const newProjectNumber = await firestoreAdmin.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(userCounterRef);
        if (!counterDoc.exists) {
            transaction.set(userCounterRef, { projectCount: 1 });
            return 1;
        }
        const newCount = (counterDoc.data()?.projectCount || 0) + 1;
        transaction.update(userCounterRef, { projectCount: newCount });
        return newCount;
    });

    const newProjectRef = firestoreAdmin.collection('projects').doc();

    const newProject: Omit<Project, 'id'> = {
      userId,
      projectNumber: newProjectNumber,
      projectName,
      clientName,
      hourlyRate,
      status,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await newProjectRef.set(newProject);

    return NextResponse.json({ id: newProjectRef.id, ...newProject }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid skapande av projekt.' }), { status: 500 });
  }
}
