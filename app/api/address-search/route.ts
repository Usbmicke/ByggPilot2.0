
import { NextResponse } from 'next/server';

// =================================================================================
// GULDSTANDARD - Adress-sök Proxy V1.1 (Korrekt Plats)
// FUNKTION: Agerar som en mellanhand (proxy) till Lantmäteriets API.
// ANLEDNING: Löser CORS-problemet genom att flytta det externa API-anropet
// till server-sidan, där CORS-regler inte gäller. Denna fil är nu placerad
// i den korrekta mappen för att lösa 404-felet.
// =================================================================================

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Sökfråga saknas' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://api.lantmateriet.se/geo/plats/v1/platsnamn/sok?namn=${encodeURIComponent(query)}&max-antal-svar=5`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Lantmäteriet API fel: ${response.status}`, errorText);
            return NextResponse.json({ error: `Fel från Lantmäteriet: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        console.error("Internt proxy-fel vid adress-sökning:", error);
        return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 });
    }
}
