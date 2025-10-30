
import { NextResponse } from 'next/server';

/**
 * API-slutpunkt för att verifiera ett organisationsnummer mot Bolagsverkets öppna API.
 */
export async function POST(request: Request) {
  try {
    const { orgnr } = await request.json();

    if (!orgnr) {
      return NextResponse.json({ message: 'Organisationsnummer saknas.' }, { status: 400 });
    }

    // Normalisera organisationsnumret (ta bort bindestreck och andra tecken)
    const cleanOrgnr = orgnr.replace(/\D/g, '');

    // Anropa Bolagsverkets öppna API. Notera: Detta är en exempel-URL och kan behöva justeras.
    // Enligt Bolagsverkets dokumentation verkar det inte finnas ett helt öppet realtids-API utan registrering.
    // Vi antar här att ett sådant API existerar på denna adress för att bygga flödet.
    const apiEndpoint = `https://api.bolagsverket.se/foretagsinformation/v2/foretag/${cleanOrgnr}`;
    
    // I ett verkligt scenario skulle vi behöva hantera en API-nyckel här.
    // const response = await fetch(apiEndpoint, { headers: { 'Authorization': `Bearer ${process.env.BOLAGSVERKET_API_KEY}` } });

    // -- SIMULERAD API-SVAR (eftersom det inte finns ett öppet, nyckellöst realtids-API) --
    // Om organisationsnumret är "556677-8899", returnera ett framgångsrikt svar.
    if (cleanOrgnr === '5566778899') {
        const mockData = {
            foretagsnamn: 'Testbolaget i Sverige AB',
            adress: {
                postort: 'STOCKHOLM',
                postnummer: '123 45',
                utdelningsadress1: 'Exempelgatan 1'
            },
            status: {
                foretagsform: 'Aktiebolag',
                status: 'Aktivt',
            }
        };
        return NextResponse.json(mockData);
    } else {
        // För alla andra nummer, simulera att företaget inte hittades.
        return NextResponse.json({ message: `Kunde inte hitta något företag med organisationsnummer ${orgnr}.` }, { status: 404 });
    }
    // -- SLUT PÅ SIMULERING --

  } catch (error) {
    console.error("Error in verify-company API: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: `Internt serverfel: ${errorMessage}` }, { status: 500 });
  }
}
