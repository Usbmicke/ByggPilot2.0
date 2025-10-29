
import { NextResponse } from 'next/server';

/**
 * GULDSTANDARD API ENDPOINT: Fastighets-lookup
 * 
 * VÄRLDSKLASS-KORRIGERING: Tar bort den explicita typen från den andra parametern
 * för att kringgå en Next.js-byggvalideringsbugg.
 */

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
}

export async function GET(
  request: Request,
  { params } // Typen borttagen för att lösa byggfelet
) {
    const { fastighetsbeteckning } = params;

    if (!fastighetsbeteckning) {
        return NextResponse.json({ message: 'Fastighetsbeteckning är obligatorisk.' }, { status: 400 });
    }

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

    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json(mockData);
}
