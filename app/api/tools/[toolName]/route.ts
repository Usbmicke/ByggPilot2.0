
import { NextResponse } from 'next/server';
import { tools } from '@/lib/tools';
import logger from '@/lib/logger';
import { z } from 'zod';

// =================================================================================
// DYNAMISK VERKTYGS-API (v1.0 - Guldstandard)
//
// Beskrivning: Denna API-route agerar som en säker gateway för att köra verktyg.
// Frontend skickar namnet på verktyget och dess argument, och denna route
// validerar och exekverar det på serversidan.
// =================================================================================

const ToolRunRequestSchema = z.object({
  args: z.any(),
});

export async function POST(request: Request, { params }: { params: { toolName: string } }) {
    const { toolName } = params;
    const requestLogger = logger.child({ toolName });

    try {
        // Hitta verktyget i vårt bibliotek
        const tool = (tools as any)[toolName];
        if (!tool) {
            requestLogger.warn("Försök att anropa ett okänt verktyg.");
            return NextResponse.json({ error: `Tool '${toolName}' not found.` }, { status: 404 });
        }

        // Validera och hämta argumenten från request body
        const rawBody = await request.json();
        const validationResult = ToolRunRequestSchema.safeParse(rawBody);

        if (!validationResult.success) {
            return NextResponse.json({ error: validationResult.error.flatten() }, { status: 400 });
        }

        const { args } = validationResult.data;

        // Kör verktygets execute-funktion med de validerade argumenten
        // DAL inuti verktyget hanterar sessionsvalidering
        requestLogger.info({ args }, "Exekverar verktyg via API.");
        const result = await tool.execute(args);

        return NextResponse.json({ result });

    } catch (error: any) {
        // Om DAL kastar ett "Unauthorized"-fel, skicka tillbaka 401
        if (error.message === 'Unauthorized') {
            requestLogger.warn("Obehörigt verktygsanrop.");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        requestLogger.error({ error: error.message, stack: error.stack }, "Fel vid exekvering av verktyg.");
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
