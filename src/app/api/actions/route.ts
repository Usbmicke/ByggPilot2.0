
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/config/authOptions";
import { getNewActions, updateActionStatus } from "@/lib/dal/actions";

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
        const actions = await getNewActions(userId);
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

        const allowedStatus = ['ignored', 'archived', 'done'];
        if (!allowedStatus.includes(newStatus)) {
            return NextResponse.json({ message: "Ogiltig status." }, { status: 400 });
        }

        await updateActionStatus(userId, actionId, newStatus);
        console.log(`Uppdaterade status för åtgärd ${actionId} till ${newStatus} för användare ${userId}`);

        return NextResponse.json({ success: true });

    } catch (error) {
        if (error instanceof Error && error.message === "Action not found") {
            return NextResponse.json({ message: "Åtgärden hittades inte." }, { status: 404 });
        }
        console.error(`Fel vid uppdatering av åtgärd för användare ${userId}:`, error);
        return NextResponse.json({ message: "Ett internt serverfel inträffade." }, { status: 500 });
    }
}
