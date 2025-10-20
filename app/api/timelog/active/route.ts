
import { NextResponse } from 'next/server';
import * as dal from '@/lib/data-access';
import logger from '@/lib/logger';

/**
 * GET-metod för att hämta den aktiva (pågående) tidrapporten för den autentiserade användaren.
 * Anropar DAL för att på ett säkert sätt hämta datan.
 */
export async function GET(request: Request) {
    try {
        // DAL-funktionen hanterar all logik, inklusive sessionsvalidering.
        const activeTimer = await dal.getActiveTimeEntry();

        // Om ingen aktiv timer hittas, returneras null, vilket är ett förväntat och normalt scenario.
        return NextResponse.json({ activeTimer });

    } catch (error: any) {
        // DAL hanterar detaljerad intern loggning. Här loggar vi kontexten för själva API-anropet.
        logger.error({ 
            error: error.message, 
            stack: error.stack 
        }, '[API /timelog/active GET] Failed to fetch active time entry.');

        // Skicka ett generiskt och säkert felmeddelande till klienten.
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return NextResponse.json({ error: 'Internal Server Error' }, { status });
    }
}
