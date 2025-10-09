
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/admin";
import { ProjectStatus } from '@/app/types';

// --- Hämta projekt (Befintlig funktion) ---
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Åtkomst nekad." }, { status: 401 });
    }
    try {
        const projectsRef = adminDb.collection('projects');
        const query = projectsRef
            .where('userId', '==', session.user.id)
            .orderBy('createdAt', 'desc');
        const querySnapshot = await query.get();
        if (querySnapshot.empty) {
            return NextResponse.json([]);
        }
        const projects = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name, // Korrigerat från projectName till name
                customerName: data.customerName,
                status: data.status,
                lastActivity: data.createdAt.toDate().toISOString(), // Använder createdAt som lastActivity
            };
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error("Fel vid hämtning av projekt:", error);
        return NextResponse.json({ message: "Internt serverfel." }, { status: 500 });
    }
}

// --- NYHET: Skapa ett nytt projekt ---
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Åtkomst nekad." }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, customerId, customerName, status } = body;

        // Validering av inkommande data
        if (!name || !customerId || !customerName || !status) {
            return NextResponse.json({ message: 'All fält (name, customerId, customerName, status) är obligatoriska.' }, { status: 400 });
        }
        
        // Validera att status är en giltig ProjectStatus
        if (!Object.values(ProjectStatus).includes(status)) {
             return NextResponse.json({ message: 'Ogiltig status-värde.' }, { status: 400 });
        }

        const newProjectData = {
            userId: session.user.id,
            name,
            customerId,
            customerName,
            status,
            createdAt: new Date(),
        };

        const projectRef = await adminDb.collection('projects').add(newProjectData);

        const newProject = {
            id: projectRef.id,
            ...newProjectData,
            // Konvertera Date till ISO-sträng för JSON-svaret
            createdAt: newProjectData.createdAt.toISOString(), 
        };

        // Returnera det fullständiga, nyskapade objektet
        return NextResponse.json(newProject, { status: 201 });

    } catch (error) {
        console.error("Fel vid skapande av projekt:", error);
        if (error instanceof SyntaxError) { // Fångar ogiltig JSON i request body
            return NextResponse.json({ message: "Felaktig förfrågan (ogiltig JSON)." }, { status: 400 });
        }
        return NextResponse.json({ message: "Internt serverfel vid skapande av projekt." }, { status: 500 });
    }
}
