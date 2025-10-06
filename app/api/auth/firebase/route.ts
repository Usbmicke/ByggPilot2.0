
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { admin } from "@/lib/firebase-admin";
import { headers } from "next/headers"; // Importera headers för loggning

export async function POST(request: Request) {
    // --- DIAGNOSTISK LOGGNING ---
    const headersList = headers();
    console.log("INCOMING HEADERS in /api/auth/firebase:", Object.fromEntries(headersList.entries()));
    // --- SLUT PÅ LOGGNING ---

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        // --- DIAGNOSTISK LOGGNING ---
        console.error("[Firebase Token API] Kunde inte hämta session. Sessionsobjekt:", session);
        // --- SLUT PÅ LOGGNING ---
        return NextResponse.json({ error: "Ej auktoriserad: Ingen NextAuth-session hittades." }, { status: 401 });
    }

    const uid = session.user.id;

    try {
        const customToken = await admin.auth().createCustomToken(uid);
        console.log(`[Firebase Token API] Skapade custom token för UID: ${uid}`)
        return NextResponse.json({ firebaseToken: customToken });

    } catch (error) {
        console.error("[Firebase Token API] Fel vid skapande av anpassad token:", error);
        return NextResponse.json({ error: "Internt serverfel vid generering av Firebase-token." }, { status: 500 });
    }
}
