
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OAuth2Client } from 'google-auth-library';


// Hjälpfunktion för att hitta en fil/mapp och returnera dess ID, eller null om den inte finns.
async function findFileId(drive: any, query: string): Promise<string | null> {
    try {
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            pageSize: 1,
        });
        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id;
        }
        return null;
    } catch (error) {
        console.error(`Error finding file with query "${query}":`, error);
        throw new Error('Could not search for files in Google Drive.');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
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
        const docs = google.docs({ version: 'v1', auth: oAuth2Client });

        // 1. Kontrollera om mappstrukturen redan finns
        const mainFolderId = await findFileId(drive, "name='ByggPilot Projekt' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false");
        if (mainFolderId) {
            return res.status(200).json({ message: 'Project structure already exists.' });
        }

        // 2. Skapa mappstrukturen
        const mainFolder = await drive.files.create({
            requestBody: { name: 'ByggPilot Projekt', mimeType: 'application/vnd.google-apps.folder' },
            fields: 'id',
        });
        const newMainFolderId = mainFolder.data.id;
        if (!newMainFolderId) throw new Error('Could not create main project folder.');

        const subfolders = ['01_Kunder & Anbud', '02_Pågående Projekt', '03_Avslutade Projekt', '04_Företagsmallar', '05_Ekonomi & Fakturering'];
        let templateFolderId: string | undefined;
        for (const folderName of subfolders) {
            const created = await drive.files.create({
                requestBody: { name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: [newMainFolderId] },
                fields: 'id',
            });
            if(folderName === '04_Företagsmallar') {
                templateFolderId = created.data.id;
            }
        }
        if (!templateFolderId) throw new Error("Could not create the '04_Företagsmallar' folder.");

        // 3. Skapa och fyll offertmallen
        const templateDoc = await docs.documents.create({ requestBody: { title: 'Offertmall' } });
        const templateDocId = templateDoc.data.documentId;
        if (!templateDocId) throw new Error('Could not create the template document.');

        const requests = [
            { insertText: { location: { index: 1 }, text: 'Offert\n' } },
            { updateTextStyle: { range: { startIndex: 1, endIndex: 7 }, textStyle: { bold: true, fontSize: { magnitude: 24, unit: 'PT' } } } },
            { insertText: { location: { index: 7 }, text: 'Datum: {{DATUM}}\nOffertnummer: {{OFFERTNUMMER}}\n\n' } },
            { insertText: { location: { index: 50 }, text: 'Kund\n' } },
            { updateTextStyle: { range: { startIndex: 50, endIndex: 54 }, textStyle: { bold: true, fontSize: { magnitude: 18, unit: 'PT' } } } },
            { insertText: { location: { index: 54 }, text: 'Namn: {{KUNDNAMN}}\nAdress: {{ADRESS}}\n\n' } },
            { insertText: { location: { index: 100 }, text: 'Projektinformation\n' } },
            { updateTextStyle: { range: { startIndex: 100, endIndex: 118 }, textStyle: { bold: true, fontSize: { magnitude: 18, unit: 'PT' } } } },
            { insertText: { location: { index: 118 }, text: 'Projekttyp: {{PROJEKTTYP}}\nBeskrivning: {{PROJEKTBESKRIVNING}}\nMaterial/Önskemål: {{MATERIALVAL}}\n' } },
        ];
        await docs.documents.batchUpdate({ documentId: templateDocId, requestBody: { requests } });

        // 4. Flytta mallen till rätt mapp
        const file = await drive.files.get({ fileId: templateDocId, fields: 'parents' });
        const previousParents = file.data.parents?.join(',') || '';
        await drive.files.update({
            fileId: templateDocId,
            addParents: templateFolderId,
            removeParents: previousParents,
            fields: 'id, parents',
        });

        res.status(200).json({ message: 'Complete project structure and quote template created successfully.' });

    } catch (error: any) {
        console.error('Error creating folder structure:', error);
        res.status(500).json({ error: 'Failed to create folder structure', details: error.message });
    }
}
