
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OAuth2Client } from 'google-auth-library';

type Project = { id: string; name: string; };

async function findFileId(drive: any, query: string): Promise<string | null> {
    const res = await drive.files.list({ q: query, fields: 'files(id)', pageSize: 1 });
    if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id;
    }
    return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !(session as any).accessToken) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const oAuth2Client = new OAuth2Client();
        oAuth2Client.setCredentials({ access_token: (session as any).accessToken });

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        // 1. Hitta ID för "01_Kunder & Anbud"
        const anbudFolderId = await findFileId(drive, "name='01_Kunder & Anbud' and mimeType='application/vnd.google-apps.folder' and trashed=false");

        if (!anbudFolderId) {
            // Om mappen inte finns (t.ex. ny användare) returnera en tom lista.
            return res.status(200).json({ projects: [] });
        }

        // 2. Lista alla mappar (projekt) inuti anbudsmappen
        const projectsResponse = await drive.files.list({
            q: `'${anbudFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
            orderBy: 'createdTime desc',
            pageSize: 50, // Begränsa till de 50 senaste projekten
        });

        const projects: Project[] = (projectsResponse.data.files || []).map(file => ({
            id: file.id || '',
            name: file.name || 'Namnlöst Projekt',
        }));

        res.status(200).json({ projects });

    } catch (error: any) {
        console.error('Error listing projects:', error);
        res.status(500).json({ error: 'Failed to list projects', details: error.message });
    }
}
