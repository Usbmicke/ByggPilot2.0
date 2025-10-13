
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/admin";

// GET-funktion för att hämta arkiverade kunder
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Åtkomst nekad." }, { status: 401 });
    }

    try {
        const customersRef = adminDb.collection('customers');
        const query = customersRef
            .where('userId', '==', session.user.id)
            .where('archived', '==', true) // Vi hämtar bara de som är markerade som arkiverade
            .orderBy('archivedAt', 'desc');

        const querySnapshot = await query.get();

        if (querySnapshot.empty) {
            return NextResponse.json([]);
        }

        const customers = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                // Se till att `archivedAt` är i ett konsekvent format
                archivedAt: data.archivedAt?.toDate()?.toISOString() || null,
            };
        });

        return NextResponse.json(customers);

    } catch (error) {
        console.error("Fel vid hämtning av arkiverade kunder:", error);
        return NextResponse.json({ message: "Internt serverfel vid hämtning av arkiverade kunder." }, { status: 500 });
    }
}
