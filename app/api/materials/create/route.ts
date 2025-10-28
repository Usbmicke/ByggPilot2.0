
// Fil: app/api/materials/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { Material } from "@/app/types/index";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  // VÄRLDSKLASS-KORRIGERING: Läs korrekta fält enligt Material-typen.
  const { name, pricePerUnit, quantity, unit, supplier, projectId } = await request.json();

  // VÄRLDSKLASS-KORRIGERING: Validera de nya, korrekta fälten.
  if (!name || !pricePerUnit || !quantity || !unit || !projectId) {
    return new NextResponse(JSON.stringify({ message: 'Nödvändig information saknas (name, pricePerUnit, quantity, unit, projectId).' }), { status: 400 });
  }
  if (typeof pricePerUnit !== 'number' || pricePerUnit <= 0) {
      return new NextResponse(JSON.stringify({ message: 'Pris per enhet måste vara ett positivt tal.' }), { status: 400 });
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
      return new NextResponse(JSON.stringify({ message: 'Kvantitet måste vara ett positivt tal.' }), { status: 400 });
  }

  try {
    // Verifiera att projektet tillhör den inloggade användaren (ingen ändring här)
    const projectDocRef = firestoreAdmin.collection('users').doc(session.user.id).collection('projects').doc(projectId);
    const projectDoc = await projectDocRef.get();
    if (!projectDoc.exists) {
      return new NextResponse(JSON.stringify({ message: 'Åtkomst nekad: Projektet hittades inte.' }), { status: 403 });
    }

    const newMaterialCostRef = projectDocRef.collection('material-costs').doc();

    // VÄRLDSKLASS-KORRIGERING: Skapa ett objekt som exakt matchar Material-typen.
    const newMaterial: Omit<Material, 'id'> = {
      projectId,
      name,
      pricePerUnit,
      quantity,
      unit,
      supplier: supplier || undefined,
    };

    await newMaterialCostRef.set(newMaterial);

    const result: Material = {
        id: newMaterialCostRef.id,
        ...newMaterial,
    }

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating material cost:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid skapande av materialkostnad.' }), { status: 500 });
  }
}
