
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/config/authOptions"; // Korrigerad importväg
import { firestoreAdmin } from "@/lib/config/firebase-admin";

// GET-funktion för att hämta användarinställningar
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Åtkomst nekad." }, { status: 401 });
    }

    try {
        // I detta initiala skede hämtar vi bara grundläggande användarinformation.
        // I framtiden kan vi hämta från en specifik 'settings'-collection i firestore.
        const userSettings = {
            name: session.user.name,
            email: session.user.email,
            // Hårdkodad vision för demonstrationssyfte. Detta kommer att göras dynamiskt.
            companyVision: "Att vara den mest pålitliga och effektiva byggpartnern i regionen, känd för kvalitet och innovation."
        };

        return NextResponse.json(userSettings);

    } catch (error) {
        console.error("Fel vid hämtning av inställningar:", error);
        return NextResponse.json({ message: "Internt serverfel vid hämtning av inställningar." }, { status: 500 });
    }
}

// POST-funktion kan läggas till här i framtiden för att spara inställningar.
