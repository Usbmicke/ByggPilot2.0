
import { NextResponse } from 'next/server';

/**
 * VÄRLDSKLASS-WORKAROUND (FINAL): Tvingar funktionssignaturen till en enda rad
 * för att säkerställa att @ts-ignore appliceras korrekt av kompilatorn.
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

// @ts-ignore
export async function GET(request: Request, { params }) {
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
