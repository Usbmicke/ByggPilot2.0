
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";

// Hämtar en lista över projekt för den inloggade användaren
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    // Säkerhetskontroll: Verifiera att användaren är inloggad
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Åtkomst nekad. Du måste vara inloggad." }, { status: 401 });
    }

    try {
        // Bygg en databasfråga för att hämta användarens projekt, sorterade efter skapelsedatum
        const projectsRef = firestoreAdmin.collection('projects');
        const query = projectsRef
            .where('userId', '==', session.user.id)
            .orderBy('createdAt', 'desc');
        
        const querySnapshot = await query.get();

        // Om inga projekt hittas, returnera en tom lista
        if (querySnapshot.empty) {
            return NextResponse.json([]);
        }

        // Mappa dokumenten till ett mer användbart format
        const projects = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                projectName: data.projectName,
                clientName: data.clientName,
                status: data.status,
                projectNumber: data.projectNumber || 'N/A', // Säkerställer att projectNumber finns
                createdAt: data.createdAt.toDate().toISOString(), // Konvertera Timestamp till string
            };
        });

        return NextResponse.json(projects);

    } catch (error) {
        console.error("Fel vid hämtning av projekt från Firestore:", error);
        return NextResponse.json({ message: "Internt serverfel vid hämtning av projekt." }, { status: 500 });
    }
}
