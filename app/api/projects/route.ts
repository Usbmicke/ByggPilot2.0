import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getProjects, createProject } from "@/lib/data-access";
import logger from "@/lib/logger";

/**
 * API-slutpunkt för att hämta alla projekt för en användare.
 */
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Åtkomst nekad." }, { status: 401 });
    }

    try {
        const projects = await getProjects(session.user.id);
        return NextResponse.json(projects);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internt serverfel.";
        logger.error({ 
            message: "Fel vid hämtning av projekt (API)", 
            userId: session.user.id, 
            error: errorMessage 
        });
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

/**
 * API-slutpunkt för att skapa ett nytt projekt.
 */
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Åtkomst nekad." }, { status: 401 });
    }

    try {
        const body = await request.json();
        
        // Delegera skapande och validering till DAL
        const newProject = await createProject(session.user.id, body);

        return NextResponse.json(newProject, { status: 201 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internt serverfel.";
        logger.error({ 
            message: "Fel vid skapande av projekt (API)", 
            userId: session.user.id, 
            error: errorMessage 
        });

        // Om det är ett valideringsfel från Zod (via DAL), ge en 400-status
        if (errorMessage.startsWith('Ogiltig indata')) {
            return NextResponse.json({ message: errorMessage }, { status: 400 });
        }

        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
