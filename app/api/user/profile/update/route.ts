import { NextRequest, NextResponse } from 'next/server';
import { admin, db } from '@/lib/admin';
import { FieldValue } from '@google-cloud/firestore';

// Hjälpfunktion för att validera Firebase ID-token
async function validateFirebaseIdToken(request: NextRequest): Promise<string | null> {
    const authorization = request.headers.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            return null;
        }
    }
    return null;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Autentisera användaren
        const uid = await validateFirebaseIdToken(request);
        if (!uid) {
            return NextResponse.json({ error: 'Ogiltig autentisering.' }, { status: 401 });
        }

        // 2. Hämta och validera indata
        const body = await request.json();
        const { companyVision } = body;

        if (typeof companyVision !== 'string' || companyVision.trim().length === 0) {
            return NextResponse.json({ error: 'Företagsvisionen får inte vara tom.' }, { status: 400 });
        }
         if (companyVision.length > 2000) {
            return NextResponse.json({ error: 'Visionen är för lång (max 2000 tecken).' }, { status: 400 });
        }

        // 3. Hitta användarens profildokument via UID
        const userProfileRef = db.collection('userProfiles').doc(uid);
        const userProfileSnap = await userProfileRef.get();

        if (!userProfileSnap.exists) {
             // Om profilen inte finns, skapa den med den nya visionen
            await userProfileRef.set({
                uid: uid,
                companyVision: companyVision,
                createdAt: FieldValue.serverTimestamp(),
            });
             console.log(`Skapade ny profil för UID: ${uid} och sparade visionen.`);
        } else {
             // Om profilen finns, uppdatera den med den nya visionen
            await userProfileRef.update({
                companyVision: companyVision,
                updatedAt: FieldValue.serverTimestamp(),
            });
            console.log(`Uppdaterade visionen för UID: ${uid}.`);
        }

        // 4. Skicka ett framgångssvar
        return NextResponse.json({ success: true, message: 'Företagsvisionen har sparats.' });

    } catch (error) {
        console.error('Fel vid uppdatering av företagsvision:', error);
        // Generellt felmeddelande för att inte läcka implementation-detaljer
        return NextResponse.json({ error: 'Ett internt serverfel uppstod.' }, { status: 500 });
    }
}
