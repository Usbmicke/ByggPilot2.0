
'use server';

import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import { getAccountByUserId, updateAccount } from '@/lib/dal/accounts';

export async function authenticate() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        throw new Error("Användaren är inte inloggad eller sessionen är ogiltig.");
    }

    const account = await getAccountByUserId(session.user.id);

    if (!account || !account.access_token || !account.refresh_token || !account.providerAccountId) {
        console.log("Kunde inte hitta Google-konto eller så saknas tokens.");
        throw new Error("Användaren har inte kopplat ett Google-konto eller så saknas nödvändiga tokens.");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    });

    // Försök att förnya token om den är på väg att gå ut
    try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        // Uppdatera databasen med den nya access_token via DAL
        await updateAccount(account.providerAccountId, {
            access_token: credentials.access_token!,
            refresh_token: credentials.refresh_token || account.refresh_token!,
            expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : account.expires_at!,
        });

    } catch (error) {
        console.error("Kunde inte förnya access token:", error);
        throw new Error("Kunde inte förnya Google-sessionen. Vänligen logga in igen.");
    }

    return oauth2Client;
}
