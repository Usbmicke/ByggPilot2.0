
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// KORREKT IMPORT: Importera hela 'admin'-objektet
import { admin } from "@/app/lib/firebase-admin";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Ej auktoriserad: Ingen NextAuth-session hittades." }, { status: 401 });
    }

    const uid = session.user.id;

    try {
        // KORREKT ANROP: Använd admin.auth() för att skapa token
        const customToken = await admin.auth().createCustomToken(uid);

        return NextResponse.json({ firebaseToken: customToken });

    } catch (error) {
        console.error("[Firebase Token API] Fel vid skapande av anpassad token:", error);
        return NextResponse.json({ error: "Internt serverfel vid generering av Firebase-token." }, { status: 500 });
    }
}
