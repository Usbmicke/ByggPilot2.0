
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { firestoreAdmin } from "@/app/lib/firebase-admin";

/**
 * API-rutt för att hämta alla nya, föreslagna åtgärder för en användare.
 */
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Åtkomst nekad" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const db = firestoreAdmin;
        const actionsSnapshot = await db.collection('users').doc(userId)
                                       .collection('actions')
                                       .where('status', '==', 'new') // Hämta bara nya åtgärder
                                       .orderBy('createdAt', 'desc') // De nyaste först
                                       .get();

        if (actionsSnapshot.empty) {
            return NextResponse.json([]); // Returnera en tom lista om inga åtgärder finns
        }

        // Mappa dokumenten till en mer lätthanterlig array av objekt
        const actions = actionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json(actions);

    } catch (error) {
        console.error(`Fel vid hämtning av åtgärder för användare ${userId}:`, error);
        return NextResponse.json({ message: "Ett internt serverfel inträffade." }, { status: 500 });
    }
}

/**
 * API-rutt för att uppdatera statusen på en åtgärd (t.ex. ignorera den).
 */
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Åtkomst nekad" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { actionId, newStatus } = await request.json();

        if (!actionId || !newStatus) {
            return NextResponse.json({ message: "Action ID och ny status krävs." }, { status: 400 });
        }

        // Validera att den nya statusen är en av de tillåtna
        const allowedStatus = ['ignored', 'archived', 'done'];
        if (!allowedStatus.includes(newStatus)) {
            return NextResponse.json({ message: "Ogiltig status." }, { status: 400 });
        }

        const db = firestoreAdmin;
        const actionRef = db.collection('users').doc(userId).collection('actions').doc(actionId);

        // Kontrollera att åtgärden faktiskt finns innan vi försöker uppdatera den
        const doc = await actionRef.get();
        if (!doc.exists) {
            return NextResponse.json({ message: "Åtgärden hittades inte." }, { status: 404 });
        }

        await actionRef.update({ status: newStatus });

        console.log(`Uppdaterade status för åtgärd ${actionId} till ${newStatus} för användare ${userId}`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(`Fel vid uppdatering av åtgärd för användare ${userId}:`, error);
        return NextResponse.json({ message: "Ett internt serverfel inträffade." }, { status: 500 });
    }
}
