
import { NextRequest, NextResponse } from 'next/server';
import { createProjectFolderStructure } from '@/app/actions/driveActions';

export async function POST(req: NextRequest) {
    // VÄRLDSKLASS-KORRIGERING: Extraktera nödvändig data från request body.
    const { action, projectId, projectName } = await req.json();

    if (action === 'createProjectFolderStructure') {
        // Validera att vi har fått den information som krävs.
        if (!projectId || !projectName) {
            return NextResponse.json({ error: 'ProjectId och ProjectName är obligatoriska för denna åtgärd.' }, { status: 400 });
        }

        try {
            // Skicka med de argument som funktionen förväntar sig.
            const result = await createProjectFolderStructure(projectId, projectName);
            if (result.success) {
                return NextResponse.json({ message: `Mappstruktur för '${projectName}' har skapats i Google Drive.` });
            } else {
                // Skicka vidare det specifika felet från action-funktionen.
                return NextResponse.json({ error: result.error }, { status: 500 });
            }
        } catch (error) {
            // Logga det faktiska felet på servern för felsökning.
            console.error("Fel i /api/chat/route.ts:", error);
            return NextResponse.json({ error: 'Ett internt serverfel uppstod.' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Okänd åtgärd' }, { status: 400 });
}
