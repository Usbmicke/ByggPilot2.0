
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/authOptions'; // Korrigerad importväg
import { prisma } from '@/app/lib/prisma';

export async function authenticate() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        throw new Error("Användaren är inte inloggad eller sessionen är ogiltig.");
    }

    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: 'google'
        },
    });

    if (!account || !account.access_token || !account.refresh_token) {
        console.log("Kunde inte hitta Google-konto eller så saknas tokens.");
        throw new Error("Användaren har inte kopplat ett Google-konto eller så saknas nödvändiga tokens.");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    // VÄRLDSKLASS-KORRIGERING: Korrigerat stavfel från 'oauth2Clien' till 'oauth2Client'.
    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    });

    // Försök att förnya token om den är på väg att gå ut
    try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        // Uppdatera databasen med den nya access_token (och refresh_token om en ny tillhandahålls)
        await prisma.account.update({
            where: {
                provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: account.providerAccountId,
                },
            },
            data: {
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token || account.refresh_token,
                expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : account.expires_at,
            },
        });

    } catch (error) {
        console.error("Kunde inte förnya access token:", error);
        // Om refresh token är ogiltig, kasta ett mer specifikt fel
        throw new Error("Kunde inte förnya Google-sessionen. Vänligen logga in igen.");
    }

    return oauth2Client;
}
