
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/admin";
import { encrypt } from "@/lib/encryption";
import { google } from 'googleapis';

const getOAuth2Client = () => {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/integrations/google/callback';

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error("Google OAuth-klientuppgifter är inte konfigurerade.");
    }

    return new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );
};

/**
 * Denna API-rutt hanterar callbacken från Googles OAuth-flöde.
 * Den tar emot en auktorisationskod, byter den mot tokens och lagrar dem säkert i Firestore.
 */
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        console.error("[Auth Callback] Ingen session eller användar-ID hittades.");
        return NextResponse.redirect(new URL('/settings/integrations?error=AuthenticationFailed', request.url));
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) {
        return NextResponse.redirect(new URL('/settings/integrations?error=NoCode', request.url));
    }

    try {
        const oauth2Client = getOAuth2Client();

        // Byt ut auktorisationskoden mot riktiga tokens
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Mottagna tokens från Google:', tokens);

        if (!tokens.access_token || !tokens.refresh_token) {
             throw new Error("Nödvändiga tokens (access & refresh) mottogs inte från Google.");
        }

        const encryptedAccessToken = encrypt(tokens.access_token);
        const encryptedRefreshToken = encrypt(tokens.refresh_token);

        const db = adminDb;
        const batch = db.batch();

        const integrationRef = db.collection('users').doc(userId).collection('integrations').doc('google');
        batch.set(integrationRef, {
            provider: 'google',
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken, // Refresh tokens är viktiga för långsiktig åtkomst
            expiresAt: tokens.expiry_date,
            scope: tokens.scope,
            updatedAt: new Date(),
        }, { merge: true });

        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, { hasGoogleIntegration: true });

        await batch.commit();
        console.log(`Krypterade tokens har sparats och användarflagga har satts för ${userId}`);

        const redirectUrl = new URL('/settings/integrations', request.url);
        redirectUrl.searchParams.set('success', 'google_connected');
        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error("[Auth Callback] Ett fel inträffade under token-utbyte eller lagring:", error);
        const errorType = (error as any).code === 'EAUTH' ? 'TokenExchangeFailed' : 'InternalError';
        return NextResponse.redirect(new URL(`/settings/integrations?error=${errorType}`, request.url));
    }
}
