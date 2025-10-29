
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { createMaterialInDb } from "@/app/lib/dal/material";
import { Material } from "@/app/types/index";

/**
 * GULDSTANDARD API-ROUTE: POST /api/materials/create
 * Hanterar skapandet av ett nytt material genom att validera input och
 * anropa DAL-funktionen `createMaterialInDb`.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { projectId, name, pricePerUnit, quantity, unit, supplier } = body;

    if (!projectId || !name || pricePerUnit === undefined || quantity === undefined || !unit) {
        return new NextResponse(JSON.stringify({ message: 'Nödvändig information saknas (projectId, name, pricePerUnit, quantity, unit).' }), { status: 400 });
    }

    // Bygg upp material-data-objektet för DAL-funktionen
    const materialData: Omit<Material, 'id' | 'price' | 'date' | 'projectId'> = {
        name,
        quantity,
        pricePerUnit,
        unit,
        supplier
    };

    // Anropa DAL-funktionen för att skapa materialet i databasen
    const newMaterial = await createMaterialInDb(userId, projectId, materialData);

    return NextResponse.json(newMaterial, { status: 201 });

  } catch (error: any) {
    console.error('API Error - create material:', error);
    // Skicka ett mer informativt felmeddelande till klienten vid behov
    if (error.message.includes('Projektet hittades inte')) {
        return new NextResponse(JSON.stringify({ message: error.message }), { status: 404 });
    }
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel.' }), { status: 500 });
  }
}
