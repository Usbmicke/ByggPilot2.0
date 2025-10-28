
import { NextRequest, NextResponse } from "next/server";

/**
 * API-rutt för att slå upp företagsinformation baserat på organisationsnummer.
 * I ett verkligt scenario skulle denna rutt anropa en extern tjänst (t.ex. från Skatteverket, Bolagsverket eller en dataleverantör som Allabolag) 
 * för att hämta live-data. För demonstrationsändamål simulerar vi detta anrop.
 * 
 * @param request NextRequest-objektet (används ej här, men krävs av Next.js).
 * @param context Objekt som innehåller dynamiska route-parametrar, i detta fall `orgnr`.
 */
export async function GET(request: NextRequest, context: { params: { orgnr: string } }) {
    const { orgnr } = context.params;

    // Validering: Kontrollera att ett organisationsnummer har angetts
    if (!orgnr) {
        return NextResponse.json({ message: "Organisationsnummer saknas." }, { status: 400 });
    }

    // --- Simulering av externt API-anrop ---
    // I en verklig applikation skulle koden nedan ersättas med en fetch() till en extern tjänst.
    // Vi använder en enkel logik för att returnera olika mock-data baserat på det angivna numret.
    
    console.log(`[API] Slår upp organisationsnummer: ${orgnr}`);

    try {
        let mockData;

        // Mock-data scenario 1: Ett "giltigt" företag med F-skatt
        if (orgnr.startsWith('556')) {
            mockData = {
                orgnr: orgnr,
                companyName: "Fogelströms Bygg & Renovering AB",
                isVatRegistered: true,
                hasFtax: true,
                address: {
                    street: "Byggvägen 1A",
                    zipCode: "123 45",
                    city: "Stockholm"
                }
            };
        // Mock-data scenario 2: Ett företag som saknar F-skatt (varningsfall)
        } else if (orgnr.startsWith('559')) {
            mockData = {
                orgnr: orgnr,
                companyName: "Micke Fixar Allt AB",
                isVatRegistered: true,
                hasFtax: false, // Varning!
                address: {
                    street: "Fuskgränd 2B",
                    zipCode: "543 21",
                    city: "Göteborg"
                }
            };
        // Fallback: Företaget hittades inte
        } else {
            return NextResponse.json({ message: `Inget företag med organisationsnummer ${orgnr} kunde hittas.` }, { status: 404 });
        }

        return NextResponse.json(mockData);

    } catch (error) {
        console.error("[API] Fel vid uppslag av företag:", error);
        return NextResponse.json({ message: "Ett oväntat fel inträffade vid uppslag av företag." }, { status: 500 });
    }
}
