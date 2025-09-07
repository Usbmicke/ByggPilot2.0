
import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { getSession } from 'next-auth/react';

// Denna API-route hämtar användarens kontakter från Google People API.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // Säkerhetskontroll: Se till att användaren är inloggad.
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Skapa en ny OAuth2-klient med den sparade access-token.
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    // Initiera People API-klienten.
    const people = google.people({ version: 'v1', auth: oauth2Client });

    // Hämta en lista över användarens kontakter.
    // Vi specificerar vilka fält vi vill ha för varje person för att vara effektiva.
    const response = await people.people.connections.list({
      resourceName: 'people/me',
      pageSize: 500, // Justera vid behov
      personFields: 'names,emailAddresses,phoneNumbers',
    });

    const connections = response.data.connections || [];

    // Formatera datan till ett mer lätthanterligt format.
    const contacts = connections.map(person => {
      return {
        id: person.resourceName,
        name: person.names && person.names.length > 0 ? person.names[0].displayName : 'No name',
        email: person.emailAddresses && person.emailAddresses.length > 0 ? person.emailAddresses[0].value : 'No email',
        phone: person.phoneNumbers && person.phoneNumbers.length > 0 ? person.phoneNumbers[0].value : 'No phone number',
      };
    });

    res.status(200).json({ contacts });

  } catch (error) {
    console.error('Error fetching Google Contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts from Google.' });
  }
}
