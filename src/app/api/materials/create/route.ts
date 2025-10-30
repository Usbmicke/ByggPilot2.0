
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/config/authOptions";
import { createMaterialInDb } from "@/lib/dal/material";
import { Material } from "@/lib/types";

/**
 * GULDSTANDARD API-ROUTE: POST /api/materials/create
 * Skapar ett nytt material för ett projekt.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Autentisering krävs." }), { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Invänta och typa request-kroppen direkt.
    // Notera: projectId finns här, men är inte en del av Omit-typen för createMaterialInDb.
    const materialRequestData: Omit<Material, 'id'> & { projectId: string } = await req.json();

    const { projectId, ...materialData } = materialRequestData;

    if (!projectId) {
      return new NextResponse(JSON.stringify({ error: "Projekt-ID saknas." }), { status: 400 });
    }

    // **KORRIGERING:** Skicka med alla tre nödvändiga argument.
    const newMaterial = await createMaterialInDb(userId, projectId, materialData);

    if (!newMaterial) {
        // Detta block nås teoretiskt inte eftersom createMaterialInDb skulle kasta ett fel.
        // Men det är bra praxis att ha en fallback.
        return new NextResponse(JSON.stringify({ error: "Kunde inte skapa material." }), { status: 500 });
    }

    return new NextResponse(JSON.stringify(newMaterial), { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    // Fångar fel som kastas från DAL-skiktet, t.ex. om projektet inte finns.
    console.error("[API-FEL] POST /api/materials/create:", error);
    const errorMessage = error instanceof Error ? error.message : "Ett serverfel inträffade.";
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
