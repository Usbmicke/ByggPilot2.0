
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/admin';
import { FieldValue } from 'firebase-admin/firestore';

// =================================================================================
// TILLFÄLLIG ENGÅNGSÅTGÄRD V2: Återställ Tour-status med Type Assertion
// SYFTE: Att kirurgiskt ta bort det potentiellt korrupta `tourCompleted`-fältet.
// REVIDERING: Lägger till en inline type assertion `(session.user as { id: string })`
// för att tvinga TypeScript att känna igen `id`-fältet i en `ts-node` miljö.
// DENNA FIL SKA RADERAS EFTER ANVÄNDNING.
// =================================================================================
export async function resetTourStatusForCurrentUser(): Promise<{ success: boolean; message: string }> {
    const session = await getServerSession(authOptions);

    // Tvinga typen för att lösa `ts-node` problemet
    const userId = (session?.user as { id: string })?.id;

    if (!userId) {
        const errorMsg = "Session eller användar-ID hittades inte. Kan inte återställa tour-status.";
        console.error(errorMsg);
        return { success: false, message: errorMsg };
    }

    try {
        const userRef = adminDb.collection('users').doc(userId);

        // Radera enbart `tourCompleted`-fältet. All annan data är säker.
        await userRef.update({
            tourCompleted: FieldValue.delete(),
        });

        const successMsg = `Fältet 'tourCompleted' har raderats för användare ${userId}.`;
        console.log(successMsg);
        return { success: true, message: successMsg };
    } catch (error) {
        const errorMsg = `Fel vid radering av tour-status för ${userId}: ${error}`;
        console.error(errorMsg);
        return { success: false, message: errorMsg };
    }
}
