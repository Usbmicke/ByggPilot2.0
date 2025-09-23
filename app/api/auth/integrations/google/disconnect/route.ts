
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";

/**
 * API-rutt för att koppla från en Google-integration.
 * Raderar användarens Google-tokens från Firestore.
 */
export async function POST(request: NextRequest) {
    // 1. Hämta och validera den inloggade användarens session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        console.error("[Disconnect] Åtkomst nekad: Ingen giltig session hittades.");
        return NextResponse.json({ message: "Åtkomst nekad" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        console.log(`[Disconnect] Påbörjar frånkoppling av Google för användare: ${userId}`);
        
        // 2. Definiera sökvägen till integrationsdokumentet i Firestore
        const db = firestoreAdmin;
        const integrationRef = db.collection('users').doc(userId).collection('integrations').doc('google');

        // 3. Radera dokumentet
        await integrationRef.delete();

        console.log(`[Disconnect] Google-integrationen har raderats från Firestore för användare: ${userId}`);

        return NextResponse.json({ message: "Google-kontot har kopplats från." }, { status: 200 });

    } catch (error) {
        console.error(`[Disconnect] Ett fel inträffade vid radering av integration för användare ${userId}:`, error);
        return NextResponse.json({ message: "Ett serverfel inträffade." }, { status: 500 });
    }
}
