
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/lib/admin";
import { NextResponse } from 'next/server';

/**
 * API-endpoint för att uppdatera en användares `termsAcknowledged`-status.
 * Detta är en skyddad route som kräver en aktiv session.
 */
export async function POST(req: Request) {
  // 1. Hämta och validera sessionen
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    console.warn("[API update-terms-status] Obehörigt försök att uppdatera villkorsstatus.");
    return new NextResponse(JSON.stringify({ message: "Obehörig" }), { status: 401 });
  }

  // 2. Validera request body (även om vi bara förväntar oss `true`)
  try {
    const body = await req.json();
    if (body.acknowledged !== true) {
      return new NextResponse(JSON.stringify({ message: "Ogiltig begäran. Fältet 'acknowledged' måste vara satt till true." }), { status: 400 });
    }
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Felaktig JSON i begäran." }), { status: 400 });
  }

  const userId = session.user.id;

  try {
    // 3. Hitta användardokumentet via ID och uppdatera det
    const userRef = firestoreAdmin.collection('users').doc(userId);
    
    await userRef.update({
      termsAcknowledged: true,
    });

    console.log(`[API update-terms-status] Användare ${userId} har godkänt villkoren.`);
    return new NextResponse(JSON.stringify({ message: "Användarstatus uppdaterad" }), { status: 200 });

  } catch (error) {
    console.error(`[API update-terms-status] Fel vid uppdatering av Firestore för användare ${userId}:`, error);
    return new NextResponse(JSON.stringify({ message: "Internt serverfel. Kunde inte uppdatera användardata." }), { status: 500 });
  }
}
