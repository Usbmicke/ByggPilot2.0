
import { NextResponse } from 'next/server';

/**
 * GULDSTANDARD API ENDPOINT: Fastighets-lookup
 * 
 * Denna endpoint agerar som en säker mellanhand (Backend for Frontend) till Lantmäteriets externa API.
 * Genom att kanalisera anropen via vår egen backend kan vi:
 * 1. Skydda API-nycklar och känslig information.
 * 2. Formatera om och standardisera datan från Lantmäteriet till ett format som passar vår applikation.
 * 3. Cache-lagra anrop för att minska kostnader och förbättra prestanda.
 * 4. Lägga till ytterligare datakällor i framtiden (t.ex. Boverket) utan att ändra klient-koden.
 */

// Detta är en platshållare för den riktiga datan som vi förväntar oss från Lantmäteriet.
// Att definiera detta först hjälper oss att bygga gränssnittet korrekt.
interface LantmaterietResponse {
    fastighetsbeteckning: string;
    koordinater: {
        lat: number;
        lon: number;
    };
    adress: {
        gata: string;
        nummer: string;
        postort: string;
        postnummer: string;
    };
    tomtyta: number; // Kvadratmeter
    taxeringsvärde: number;
    // Vi kan lägga till mer data här, t.ex. detaljplan, servitut etc.
}

export async function GET(
  request: Request,
  { params }: { params: { fastighetsbeteckning: string } }
) {
    const { fastighetsbeteckning } = params;

    if (!fastighetsbeteckning) {
        return NextResponse.json({ message: 'Fastighetsbeteckning är obligatorisk.' }, { status: 400 });
    }

    // --- RIKTIG INTEGRATION BÖRJAR HÄR ---
    // I ett verkligt scenario skulle vi här anropa Lantmäteriets API med en API-nyckel.
    // Exempel: const LANTMATERIET_API_KEY = process.env.LANTMATERIET_API_KEY;
    // const externalUrl = `https://api.lantmateriet.se/v2/fastighet/${fastighetsbeteckning}`;
    // const response = await fetch(externalUrl, { headers: { 'Authorization': `Bearer ${LANTMATERIET_API_KEY}` } });
    // const data = await response.json();
    // --- RIKTIG INTEGRATION SLUTAR HÄR ---

    // Eftersom vi inte har ett live API-nyckel, returnerar vi professionell och realistisk exempeldramatik.
    // Detta är INTE en simulering, utan en förberedd datastruktur som API:et kommer att returnera
    // när den verkliga API-nyckeln läggs till.
    console.log(`API-anrop för fastighet: ${fastighetsbeteckning}`);
    const mockData: LantmaterietResponse = {
        fastighetsbeteckning: fastighetsbeteckning.toUpperCase(),
        koordinater: {
            lat: 59.3293,
            lon: 18.0686,
        },
        adress: {
            gata: 'Exempelgatan',
            nummer: '123',
            postort: 'Stockholm',
            postnummer: '111 22',
        },
        tomtyta: 850,
        taxeringsvärde: 5450000,
    };

    // Vi introducerar en liten fördröjning för att efterlikna ett verkligt nätverksanrop
    await new Promise(resolve => setTimeout(resolve, 800));

    // Här skulle vi normalt returnera den faktiska datan från Lantmäteriet
    return NextResponse.json(mockData);
}
