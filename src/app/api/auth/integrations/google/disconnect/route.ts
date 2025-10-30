
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/config/authOptions";
import { firestoreAdmin } from "@/lib/config/firebase-admin";

/**
 * API-rutt för att koppla från en Google-integration.
 * Raderar användarens Google-tokens från Firestore och tar bort flaggan på användardokumentet.
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
        
        const db = firestoreAdmin;
        const batch = db.batch();

        // 2. Definiera sökvägen till integrationsdokumentet och radera det
        const integrationRef = db.collection('users').doc(userId).collection('integrations').doc('google');
        batch.delete(integrationRef);

        // 3. Definiera sökvägen till huvudanvändardokumentet och ta bort flaggan
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, { hasGoogleIntegration: false });

        // 4. Genomför båda operationerna atomärt
        await batch.commit();

        console.log(`[Disconnect] Google-integration har raderats och flagga har tagits bort för användare: ${userId}`);

        return NextResponse.json({ message: "Google-kontot har kopplats från." }, { status: 200 });

    } catch (error) {
        console.error(`[Disconnect] Ett fel inträffade vid radering av integration för användare ${userId}:`, error);
        return NextResponse.json({ message: "Ett serverfel inträffade." }, { status: 500 });
    }
}
