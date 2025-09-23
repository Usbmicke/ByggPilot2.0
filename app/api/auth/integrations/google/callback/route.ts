
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { encrypt } from "@/app/lib/encryption";

/**
 * Denna API-rutt hanterar callbacken från Googles OAuth-flöde.
 * Den tar emot en auktorisationskod, byter den mot tokens och lagrar dem säkert i Firestore.
 */
export async function GET(request: NextRequest) {
    // 1. Hämta den inloggade användarens session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        console.error("[Auth Callback] Ingen session eller användar-ID hittades.");
        return NextResponse.redirect(new URL('/settings/integrations?error=AuthenticationFailed', request.url));
    }
    const userId = session.user.id;

    // 2. Validera auktorisationskoden från Google
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) {
        return NextResponse.redirect(new URL('/settings/integrations?error=NoCode', request.url));
    }

    // Hämta miljövariabler
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/integrations/google/callback';

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.error("Google Client ID eller Secret är inte konfigurerade i miljövariablerna.");
        return NextResponse.json({ message: "Serverkonfigurationsfel." }, { status: 500 });
    }

    try {
        // --- STEG 1: BYT KOD MOT TOKENS (SIMULERING) ---
        // TODO: Detta block ska ersättas med ett riktigt `fetch`-anrop till Googles token-slutpunkt.
        console.log('===== BYGGPILOT OAUTH CALLBACK =====');
        console.log(`Mottagen auktorisationskod: ${code}`);
        console.log('Simulerar utbyte av kod mot tokens...');
        const simulatedTokens = {
            access_token: `simulated_access_token_for_${userId}`,
            refresh_token: `simulated_refresh_token_for_${userId}`,
            expires_in: 3599,
            scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
        };
        console.log('Mottagna (simulerade) tokens:', simulatedTokens);
        
        // --- STEG 2: KRYPTERA TOKENS ---
        const encryptedAccessToken = encrypt(simulatedTokens.access_token);
        const encryptedRefreshToken = encrypt(simulatedTokens.refresh_token);
        console.log('Tokens har krypterats.');

        // --- STEG 3: LAGRA KRYPTERADE TOKENS I FIRESTORE ---
        const db = firestoreAdmin;
        const integrationRef = db.collection('users').doc(userId).collection('integrations').doc('google');
        
        await integrationRef.set({
            provider: 'google',
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            expiresAt: Date.now() + simulatedTokens.expires_in * 1000,
            scope: simulatedTokens.scope,
            updatedAt: new Date(),
        }, { merge: true });
        console.log(`Krypterade tokens har sparats i Firestore för användare ${userId}`);
        console.log('=================================================================');

        // --- STEG 4: Omdirigera användaren ---
        const redirectUrl = new URL('/settings/integrations', request.url);
        redirectUrl.searchParams.set('success', 'google_connected');
        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error("[Auth Callback] Ett fel inträffade under token-utbyte eller lagring:", error);
        return NextResponse.redirect(new URL('/settings/integrations?error=TokenExchangeFailed', request.url));
    }
}
