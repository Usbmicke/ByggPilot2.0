
// Fil: app/api/materials/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/lib/admin";
import { MaterialCost } from "@/types/material";
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  const { projectId, date, description, amount, supplier } = await request.json();

  // Validering
  if (!projectId || !date || !description || !amount) {
    return new NextResponse(JSON.stringify({ message: 'Nödvändig information saknas (projectId, date, description, amount).' }), { status: 400 });
  }
  if (typeof amount !== 'number' || amount <= 0) {
      return new NextResponse(JSON.stringify({ message: 'Kostnaden måste vara ett positivt tal.' }), { status: 400 });
  }

  try {
    // Verifiera att projektet tillhör den inloggade användaren
    const projectDoc = await firestoreAdmin.collection('projects').doc(projectId).get();
    if (!projectDoc.exists || projectDoc.data()?.userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ message: 'Åtkomst nekad till projektet.' }), { status: 403 });
    }

    const newMaterialCostRef = firestoreAdmin.collection('material-costs').doc();

    const newMaterialCost: Omit<MaterialCost, 'id'> = {
      projectId,
      date: Timestamp.fromDate(new Date(date)),
      description,
      amount,
      supplier: supplier || '',
      createdAt: Timestamp.now(),
    };

    await newMaterialCostRef.set(newMaterialCost);

    return NextResponse.json({ id: newMaterialCostRef.id, ...newMaterialCost }, { status: 201 });

  } catch (error) {
    console.error('Error creating material cost:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid skapande av materialkostnad.' }), { status: 500 });
  }
}
