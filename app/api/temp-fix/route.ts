
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/admin';
import { FieldValue } from 'firebase-admin/firestore';

// =================================================================================
// TILLFÄLLIG ENGÅNGS-API: Återställ Tour-status
// SYFTE: Att köra databaslogik inom Next.js-kontexten för att säkert radera
// det potentiellt korrupta `tourCompleted`-fältet. Anropas via `curl`.
// DENNA FIL SKA RADERAS OMEDELBART EFTER ANVÄNDNING.
// =================================================================================

export async function GET() {
    console.log("Temporär API-väg anropad för att återställa tour-status.");

    const session = await getServerSession(authOptions);

    // Notera: Vi använder den `next-auth.d.ts` typ-filen som nu kommer laddas korrekt.
    const userId = session?.user?.id;

    if (!userId) {
        const errorMsg = "API-fel: Session eller användar-ID hittades inte.";
        console.error(errorMsg);
        return NextResponse.json({ success: false, message: errorMsg }, { status: 401 });
    }

    try {
        const userRef = adminDb.collection('users').doc(userId);

        await userRef.update({
            tourCompleted: FieldValue.delete(),
        });

        const successMsg = `API-anrop lyckades: Fältet 'tourCompleted' har raderats för användare ${userId}.`;
        console.log(successMsg);
        return NextResponse.json({ success: true, message: successMsg });

    } catch (error: any) {
        const errorMsg = `API-fel vid radering av tour-status för ${userId}: ${error.message}`;
        console.error(errorMsg);
        return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
    }
}
