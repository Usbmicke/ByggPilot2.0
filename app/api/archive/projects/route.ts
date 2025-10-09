
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/lib/admin";

// GET-funktion för att hämta arkiverade projekt
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Åtkomst nekad." }, { status: 401 });
    }

    try {
        const projectsRef = firestoreAdmin.collection('projects');
        const query = projectsRef
            .where('userId', '==', session.user.id)
            .where('archived', '==', true) // Vi hämtar bara de som är markerade som arkiverade
            .orderBy('archivedAt', 'desc');
        
        const querySnapshot = await query.get();

        if (querySnapshot.empty) {
            return NextResponse.json([]);
        }

        const projects = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                customerName: data.customerName,
                // Se till att `archivedAt` är i ett konsekvent format
                archivedAt: data.archivedAt?.toDate()?.toISOString() || null,
            };
        });

        return NextResponse.json(projects);

    } catch (error) {
        console.error("Fel vid hämtning av arkiverade projekt:", error);
        return NextResponse.json({ message: "Internt serverfel vid hämtning av arkiverade projekt." }, { status: 500 });
    }
}
