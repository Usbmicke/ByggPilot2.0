
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ message: 'Google-autentisering krävs.' }, { status: 401 });
    }

    const oAuth2Client = new OAuth2Client();
    oAuth2Client.setCredentials({ access_token: session.accessToken });

    const tasks = google.tasks({ version: 'v1', auth: oAuth2Client });

    try {
        // Först, hämta alla uppgiftslistor som användaren har
        const taskListsResponse = await tasks.tasklists.list();
        const taskLists = taskListsResponse.data.items;

        if (!taskLists || taskLists.length === 0) {
            return NextResponse.json({ tasks: [] }); // Returnera tom lista om inga listor finns
        }

        // Hitta den primära uppgiftslistan (oftast den som heter "Mina uppgifter" eller liknande)
        // Här väljer vi den första som en förenkling. I en mer avancerad implementation
        // skulle man kunna låta användaren välja vilken lista som ska visas.
        const primaryList = taskLists[0];
        if (!primaryList || !primaryList.id) {
             return NextResponse.json({ tasks: [] });
        }

        // Hämta alla aktiva (ej slutförda) uppgifter från den primära listan
        const tasksResponse = await tasks.tasks.list({
            tasklist: primaryList.id,
            showCompleted: false, // Vi vill bara se aktiva uppgifter
            maxResults: 100, // Sätt en rimlig gräns
        });

        const activeTasks = tasksResponse.data.items || [];

        // Mappa om till ett enklare format för frontend
        const formattedTasks = activeTasks.map(task => ({
            id: task.id,
            title: task.title,
            notes: task.notes || null,
            due: task.due || null, // Förfallodatum
        }));

        return NextResponse.json({ tasks: formattedTasks });

    } catch (error: any) {
        console.error('Fel vid anrop av Google Tasks API:', error);
        return NextResponse.json({ message: 'Kunde inte hämta uppgifter från Google Tasks.', error: error.message }, { status: 500 });
    }
}
