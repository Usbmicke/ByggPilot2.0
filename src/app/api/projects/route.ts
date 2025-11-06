import { NextResponse } from 'next/server';
import { dal } from '@/lib/dal';
import { logger } from '@/lib/logger';

// =================================================================================
// PROJECTS API-ROUTE V1.0 - Blueprint "Sektion 5.2"
// =================================================================================
// Denna API-rutt är skapad specifikt för att SWR-klientkomponenten (ProjectList)
// ska kunna hämta projektdata på ett säkert sätt.

export async function GET() {
  try {
    // Vi återanvänder vår säkra DAL-funktion. Den validerar automatiskt sessionen.
    const projects = await dal.projects.getActive();
    return NextResponse.json(projects);
  } catch (error: any) {
    // Om DAL kastar ett fel (t.ex. pga ogiltig session), logga det och returnera ett fel.
    logger.error({ message: '[API:/api/projects] Failed to fetch projects', error: error.message });
    return new NextResponse(JSON.stringify({ message: "Authentication failed or internal error." }), { status: 401 });
  }
}
