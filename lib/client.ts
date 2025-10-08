
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

if (!SERVICE_ACCOUNT_KEY) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set in environment variables');
}

// Parse the key, ensuring that the private_key field is correctly formatted
const serviceAccount = JSON.parse(Buffer.from(SERVICE_ACCOUNT_KEY, 'base64').toString('utf8'));

const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/documents',
];

/**
 * A singleton instance of the Google Auth JWT client.
 * This prevents re-creating the client on every API call.
 */
let jwtClient: JWT;

function getJwtClient() {
    if (!jwtClient) {
        jwtClient = new google.auth.JWT(
            serviceAccount.client_email,
            undefined,
            serviceAccount.private_key.replace(/\\n/g, '\n'), // Replace escaped newlines
            SCOPES
        );
    }
    return jwtClient;
}

/**
 * A singleton instance of the Google Drive API client.
 */
let driveClient: ReturnType<typeof google.drive> | undefined;

export function getDriveClient() {
    if (!driveClient) {
        const auth = getJwtClient();
        driveClient = google.drive({ version: 'v3', auth });
    }
    return driveClient;
}

/**
 * A singleton instance of the Google Docs API client.
 */
let docsClient: ReturnType<typeof google.docs> | undefined;

export function getDocsClient() {
    if (!docsClient) {
        const auth = getJwtClient();
        docsClient = google.docs({ version: 'v1', auth });
    }
    return docsClient;
}
