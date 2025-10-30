
// Fil: app/api/time-entries/route.ts
import { NextResponse } from 'next/server';
import { getTimeEntries, createTimeEntry } from '@/app/actions/timeEntryActions';
import { TimeEntry } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Hämtar tidrapporter för ett projekt.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Projekt-ID saknas.' }, { status: 400 });
  }

  try {
    const result = await getTimeEntries(projectId);

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const serializableData = result.data.map(entry => {
      const date = entry.date as Timestamp;
      return {
        ...entry,
        date: date.toDate().toISOString(),
      };
    });

    return NextResponse.json(serializableData, { status: 200 });

  } catch (error) {
    console.error('API-fel vid hämtning av tidrapporter:', error);
    return NextResponse.json({ error: 'Internt serverfel vid hämtning av tidrapporter.' }, { status: 500 });
  }
}

/**
 * Skapar en ny tidrapport.
 */
export async function POST(request: Request) {
    try {
        // Defininear en typ för inkommande data, där `date` är en string.
        type TimeEntryPayload = Omit<TimeEntry, 'id' | 'userId' | 'date'> & { date: string };
        const body: TimeEntryPayload = await request.json();

        if (!body.projectId || !body.date || typeof body.date !== 'string' || body.hours === undefined) {
            return NextResponse.json({ error: 'Nödvändig information saknas eller är felaktig (projectId, date, hours).' }, { status: 400 });
        }

        const result = await createTimeEntry({
            projectId: body.projectId,
            // Skapar ett Date-objekt från strängen.
            date: new Date(body.date),
            hours: body.hours,
            description: body.description,
            isBilled: body.isBilled || false,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Kunde inte skapa tidrapport.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, timeEntryId: result.timeEntryId }, { status: 201 });

    } catch (error) {
        console.error('API-fel vid skapande av tidrapport:', error);
        return NextResponse.json({ error: 'Ett internt serverfel uppstod.' }, { status: 500 });
    }
}
