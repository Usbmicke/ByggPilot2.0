
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // Importera dina authOptions
import { adminDb } from '@/lib/admin';

// =================================================================================
// API ENDPOINT: UPDATE TOUR STATUS
// ARKITEKTUR: En dedikerad, säker endpoint för att markera en användares
// guidade tur som slutförd. Använder NextAuth-sessionen för säker autentisering.
// =================================================================================

export async function POST(req: NextRequest) {
    // 1. Hämta sessionen från server-sidan
    const session = await getAuth({ req });

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // 2. Hitta användardokumentet i Firestore
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 3. Uppdatera hasSeenTour-flaggan till true
        await userRef.update({
            hasSeenTour: true,
        });

        return NextResponse.json({ success: true, message: 'Tour status updated successfully.' });

    } catch (error: any) {
        console.error('Error updating tour status:', {
            userId,
            error: error.message,
        });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
