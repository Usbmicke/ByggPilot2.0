
import { NextRequest, NextResponse } from "next/server";

/**
 * VÄRLDSKLASS-DIAGNOSTIK: Tar medvetet bort den explicita typen från den andra parametern
 * för att provocera fram ett nytt fel från byggsystemet och kringgå den nuvarande blockeringen.
 */
export async function GET(request: NextRequest, { params }) {
    const { orgnr } = params; // TypeScript kommer troligen att klaga här (implicit any)

    if (!orgnr) {
        return NextResponse.json({ message: "Organisationsnummer saknas." }, { status: 400 });
    }

    console.log(`[API] Slår upp organisationsnummer: ${orgnr}`);

    try {
        let mockData;

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
        } else if (orgnr.startsWith('559')) {
            mockData = {
                orgnr: orgnr,
                companyName: "Micke Fixar Allt AB",
                isVatRegistered: true,
                hasFtax: false,
                address: {
                    street: "Fuskgränd 2B",
                    zipCode: "543 21",
                    city: "Göteborg"
                }
            };
        } else {
            return NextResponse.json({ message: `Inget företag med organisationsnummer ${orgnr} kunde hittas.` }, { status: 404 });
        }

        return NextResponse.json(mockData);

    } catch (error) {
        console.error("[API] Fel vid uppslag av företag:", error);
        return NextResponse.json({ message: "Ett oväntat fel inträffade vid uppslag av företag." }, { status: 500 });
    }
}
