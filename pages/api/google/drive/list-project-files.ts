
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OAuth2Client } from 'google-auth-library';

// Typdefinitioner för fil- och mappobjekt
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { folderId } = req.query;

    if (!folderId || typeof folderId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid folderId parameter' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !(session as any).accessToken) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const oAuth2Client = new OAuth2Client();
        oAuth2Client.setCredentials({ access_token: (session as any).accessToken });

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        // Lista alla filer och mappar i den angivna mappen
        const filesResponse = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
            orderBy: 'folder, name',
            pageSize: 100,
        });

        const files: DriveFile[] = (filesResponse.data.files || []).map(file => ({
            id: file.id || '',
            name: file.name || 'Namnlös Fil',
            mimeType: file.mimeType || 'unknown',
            modifiedTime: file.modifiedTime || '',
            webViewLink: file.webViewLink || ''
        }));

        res.status(200).json({ files });

    } catch (error: any) {
        console.error('Error listing project files:', error);
        res.status(500).json({ error: 'Failed to list project files', details: error.message });
    }
}
