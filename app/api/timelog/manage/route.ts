
import { NextResponse } from 'next/server';
import * as dal from '@/lib/data-access';
import logger from '@/lib/logger';

/**
 * POST-metod för att starta en ny tidrapport (TimeEntry).
 * Anropar DAL-funktionen startTimeEntry som hanterar all affärslogik och säkerhet.
 */
export async function POST(request: Request) {
    try {
        const { projectId } = await request.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const newTimeEntry = await dal.startTimeEntry(projectId);

        return NextResponse.json(newTimeEntry, { status: 201 }); // 201 Created

    } catch (error: any) {
        logger.error({ 
            error: error.message, 
            stack: error.stack 
        }, '[API /timelog/manage POST] Failed to start time entry.');

        const status = error.message === 'Unauthorized' ? 401 : 500;
        return NextResponse.json({ error: 'Internal Server Error' }, { status });
    }
}

/**
 * PUT-metod för att stoppa den pågående tidrapporten.
 * Anropar DAL-funktionen stopActiveTimeEntry som hanterar logiken för att hitta och stoppa timern.
 */
export async function PUT(request: Request) {
    try {
        const stoppedTimeEntry = await dal.stopActiveTimeEntry();

        return NextResponse.json(stoppedTimeEntry);

    } catch (error: any) {
        logger.error({ 
            error: error.message, 
            stack: error.stack 
        }, '[API /timelog/manage PUT] Failed to stop time entry.');

        let status = 500;
        if (error.message === 'Unauthorized') {
            status = 401;
        } else if (error.message === 'No running timer found to stop.') {
            status = 404; // Not Found
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status });
    }
}
