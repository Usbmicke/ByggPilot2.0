
// Fil: app/api/time-entries/route.ts
import { NextResponse } from 'next/server';
import { getTimeEntries, createTimeEntry, CreateTimeEntryData } from '@/app/actions/timeEntryActions';

/**
 * Hämtar tidrapporter för ett projekt.
 * VÄRLDSKLASS-KORRIGERING: Använder den korrigerade och typsäkra `getTimeEntries`-action.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Projekt-ID saknas.' }, { status: 400 });
  }

  try {
    const result = await getTimeEntries(projectId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 }); // 401 om autentisering misslyckas
    }

    // Säkerställer att Timestamps konverteras till ISO-strängar för JSON-serialisering.
    const serializableData = result.data?.map(entry => ({
      ...entry,
      startTime: entry.startTime.toDate().toISOString(),
      endTime: entry.endTime.toDate().toISOString(),
    }));

    return NextResponse.json(serializableData, { status: 200 });

  } catch (error) {
    console.error('API-fel vid hämtning av tidrapporter:', error);
    return NextResponse.json({ error: 'Internt serverfel vid hämtning av tidrapporter.' }, { status: 500 });
  }
}

/**
 * Skapar en ny tidrapport.
 * VÄRLDSKLASS-IMPLEMENTERING: En komplett och korrekt POST-metod som använder den typsäkra `createTimeEntry`-action.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validera och konvertera indata
        const entryData: CreateTimeEntryData = {
            projectId: body.projectId,
            taskId: body.taskId,
            startTime: new Date(body.startTime),
            endTime: new Date(body.endTime),
            description: body.description,
        };

        if (!entryData.projectId || !entryData.taskId || !entryData.startTime || !entryData.endTime) {
            return NextResponse.json({ error: 'Nödvändig information saknas (projectId, taskId, startTime, endTime).' }, { status: 400 });
        }

        const result = await createTimeEntry(entryData);

        if (!result.success) {
            // Fångar upp både autentiseringsfel och andra serverside-fel från action.
            return NextResponse.json({ error: result.error || 'Kunde inte skapa tidrapport.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, timeEntryId: result.timeEntryId }, { status: 201 });

    } catch (error) {
        console.error('API-fel vid skapande av tidrapport:', error);
        return NextResponse.json({ error: 'Ett internt serverfel uppstod.' }, { status: 500 });
    }
}
