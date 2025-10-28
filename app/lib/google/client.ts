
import { google } from 'googleapis';
import { useSession } from 'next-auth/react';

export function useGoogleClient() {
    const { data: session } = useSession();

    if (!session || !session.accessToken) {
        return null;
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    return oauth2Client;
}
