
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OAuth2Client } from 'google-auth-library';

// Hjälpfunktion för att hitta filer/mappar och hantera fel
async function findFile(drive: any, query: string): Promise<string | null> {
    const res = await drive.files.list({ q: query, fields: 'files(id, name)', pageSize: 1 });
    if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id;
    }
    return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user || !(session as any).accessToken) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const quoteData = req.body;
        if (!quoteData || !quoteData.customerName) {
            return res.status(400).json({ error: 'Missing quote data' });
        }

        const oAuth2Client = new OAuth2Client();
        oAuth2Client.setCredentials({ access_token: (session as any).accessToken });

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
        const docs = google.docs({ version: 'v1', auth: oAuth2Client });

        // 1. Hitta offertmallen
        const templateFolderId = await findFile(drive, `name='04_Företagsmallar' and mimeType='application/vnd.google-apps.folder'`);
        if (!templateFolderId) throw new Error("Could not find template folder '04_Företagsmallar'");

        const templateId = await findFile(drive, `name='Offertmall' and '${templateFolderId}' in parents and trashed=false`);
        if (!templateId) throw new Error("Could not find template file 'Offertmall'");

        // 2. Skapa en kopia av mallen
        const newQuoteTitle = `Offert - ${quoteData.customerName || 'Nytt Projekt'}`;
        const copyResponse = await drive.files.copy({
            fileId: templateId,
            requestBody: { name: newQuoteTitle },
        });
        const newDocId = copyResponse.data.id;
        if (!newDocId) throw new Error("Failed to copy template");

        // 3. Fyll i informationen
        const today = new Date().toLocaleDateString('sv-SE');
        const offerNumber = `QT-${Date.now().toString().slice(-6)}`;
        const requests = [
            { replaceAllText: { containsText: { text: '{{DATUM}}', matchCase: true }, replaceText: today } },
            { replaceAllText: { containsText: { text: '{{OFFERTNUMMER}}', matchCase: true }, replaceText: offerNumber } },
            { replaceAllText: { containsText: { text: '{{KUNDNAMN}}', matchCase: true }, replaceText: quoteData.customerName || '' } },
            { replaceAllText: { containsText: { text: '{{PROJEKTTYP}}', matchCase: true }, replaceText: quoteData.projectType || '' } },
            { replaceAllText: { containsText: { text: '{{ADRESS}}', matchCase: true }, replaceText: quoteData.address || '' } },
            { replaceAllText: { containsText: { text: '{{PROJEKTBESKRIVNING}}', matchCase: true }, replaceText: quoteData.description || '' } },
            { replaceAllText: { containsText: { text: '{{MATERIALVAL}}', matchCase: true }, replaceText: quoteData.materials || '' } },
        ];
        await docs.documents.batchUpdate({ documentId: newDocId, requestBody: { requests } });

        // 4. Hitta/skapa och flytta till rätt mapp
        const anbudFolderId = await findFile(drive, `name='01_Kunder & Anbud' and mimeType='application/vnd.google-apps.folder'`);
        if (!anbudFolderId) throw new Error("Could not find folder '01_Kunder & Anbud'");
        
        let customerFolderId = await findFile(drive, `name='${quoteData.customerName}' and '${anbudFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
        if (!customerFolderId) {
            const folderMetadata = { name: quoteData.customerName, mimeType: 'application/vnd.google-apps.folder', parents: [anbudFolderId] };
            const createdFolder = await drive.files.create({ requestBody: folderMetadata, fields: 'id' });
            customerFolderId = createdFolder.data.id;
        }

        if (!customerFolderId) throw new Error("Failed to find or create customer folder");

        const originalParent = copyResponse.data.parents ? copyResponse.data.parents[0] : 'root';
        await drive.files.update({
            fileId: newDocId,
            addParents: customerFolderId,
            removeParents: originalParent,
            fields: 'id, parents'
        });

        res.status(200).json({ 
            message: "Quote created successfully!", 
            documentId: newDocId,
            url: `https://docs.google.com/document/d/${newDocId}/edit`
        });

    } catch (error: any) {
        console.error('Error in create-quote endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
