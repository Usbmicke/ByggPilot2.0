
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

    const people = google.people({ version: 'v1', auth: oAuth2Client });

    try {
        const response = await people.people.connections.list({
            resourceName: 'people/me',
            personFields: 'names,emailAddresses',
            pageSize: 500, // Hämta en rimlig mängd kontakter
            sortOrder: 'FIRST_NAME_ASCENDING',
        });

        const connections = response.data.connections || [];

        // Filtrera och mappa kontakterna till det format som frontend förväntar sig
        const contacts = connections
            .filter(person => person.names && person.names.length > 0 && person.names[0].displayName)
            .map(person => ({
                // Vi använder resourceName som ett unikt och stabilt ID
                id: person.resourceName!,
                name: person.names![0].displayName!,
            }));

        return NextResponse.json({ contacts });

    } catch (error: any) {
        console.error('Fel vid anrop av Google People API:', error);
        // Om token är utgången eller ogiltig, kan Google API:et ge ett specifikt fel
        if (error.code === 401) {
            return NextResponse.json({ message: 'Google-autentiseringen misslyckades. Prova att logga in igen.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Kunde inte hämta kontakter från Google.', error: error.message }, { status: 500 });
    }
}
