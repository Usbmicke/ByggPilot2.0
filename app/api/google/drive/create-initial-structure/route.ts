
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { firestore } from '@/app/lib/firebase/server'; // Admin SDK for server-side operations
import { auth as adminAuth } from 'firebase-admin';

// Helper to verify user and get their UID
async function verifyUser(req: NextRequest): Promise<string> {
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    return decodedToken.uid;
}

// Helper to retrieve the securely stored access token
async function getAccessToken(uid: string): Promise<string> {
    const privateDataRef = firestore.collection('users').doc(uid).collection('private').doc('google');
    const docSnap = await privateDataRef.get();
    if (!docSnap.exists) {
        throw new Error('Private user data or access token not found.');
    }
    const accessToken = docSnap.data()?.accessToken;
    if (!accessToken) {
        throw new Error('Access token is missing from private user data.');
    }
    return accessToken;
}

// Helper to get user's company name
async function getCompanyName(uid: string): Promise<string> {
    const userRef = firestore.collection('users').doc(uid);
    const docSnap = await userRef.get();
    if (docSnap.exists) {
        return docSnap.data()?.companyName || docSnap.data()?.displayName || 'Okänt Företag';
    }
    throw new Error('User profile not found.');
}

export async function POST(req: NextRequest) {
    try {
        const uid = await verifyUser(req);
        const [accessToken, companyName] = await Promise.all([
            getAccessToken(uid),
            getCompanyName(uid)
        ]);

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // 1. Create the main folder
        const mainFolderName = `📁 ByggPilot - ${companyName}`;
        const mainFolder = await drive.files.create({
            requestBody: {
                name: mainFolderName,
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id, webViewLink',
        });

        const mainFolderId = mainFolder.data.id;
        if (!mainFolderId) {
            throw new Error('Could not create main folder.');
        }

        // 2. Define and create subfolders in parallel
        const subFolders = ['01_Kunder', '02_Pågående Projekt', '03_Avslutade Projekt', '04_Företagsmallar', '05_Bokföringsunderlag'];
        const subFolderPromises = subFolders.map(folderName => 
            drive.files.create({
                requestBody: {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [mainFolderId],
                },
                fields: 'id',
            })
        );
        await Promise.all(subFolderPromises);

        // 3. Update the user's public profile with the new folder ID and status
        await firestore.collection('users').doc(uid).update({
            driveFolderStructureStatus: 'created',
            driveMainFolderId: mainFolderId,
            driveMainFolderLink: mainFolder.data.webViewLink
        });

        return NextResponse.json({ 
            success: true, 
            message: `Mappstrukturen '${mainFolderName}' har skapats! Du hittar den i din Google Drive.`,
            folderLink: mainFolder.data.webViewLink
        });

    } catch (error: any) {
        console.error('[API /create-initial-structure] Error:', error);
        const status = error.message.includes('token') || error.message.includes('authorization') ? 401 : 500;
        return NextResponse.json({ success: false, error: error.message || 'An internal server error occurred.' }, { status });
    }
}
