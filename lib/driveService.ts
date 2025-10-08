
import { getDriveClient, getDocsClient } from './client';

const ROOT_FOLDER_NAME = 'ByggPilot - App';

async function findOrCreateFolder(name: string, parentId?: string): Promise<string> {
    const drive = getDriveClient();
    let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
    if (parentId) {
        query += ` and '${parentId}' in parents`;
    }

    const res = await drive.files.list({ q: query, fields: 'files(id)' });

    if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id!;
    }

    const fileMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] }),
    };
    const folder = await drive.files.create({ requestBody: fileMetadata, fields: 'id' });
    return folder.data.id!;
}

async function getProjectFolderId(projectId: string, customerName: string): Promise<string> {
    const rootFolderId = await findOrCreateFolder(ROOT_FOLDER_NAME);
    const customerFolderName = `${projectId} - ${customerName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const projectFolderId = await findOrCreateFolder(customerFolderName, rootFolderId);
    const offersFolderId = await findOrCreateFolder('Offerter', projectFolderId);
    return offersFolderId;
}

export async function createDocumentFromTemplate(title: string, htmlContent: string): Promise<string> {
    const docs = getDocsClient();
    const document = await docs.documents.create({ requestBody: { title } });
    const documentId = document.data.documentId!;

    // Google Docs API kräver att man anropar batchUpdate för att lägga till innehåll.
    // Även om det är en enda operation, är det så API:et är designat.
    await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests: [
                {
                    insertText: {
                        location: {
                            index: 1,
                        },
                        text: '\n' // Vi kommer ersätta denna med HTML-innehåll via Drive API:et
                    }
                }
            ]
        }
    });
    
    // Uppdatera med HTML-innehåll via Drive API:et då Docs API:et inte direkt stödjer HTML-import.
    const drive = getDriveClient();
    await drive.files.update({
        fileId: documentId,
        requestBody: { },
        media: {
            mimeType: 'text/html',
            body: htmlContent,
        }
    });

    return documentId;
}

export async function exportDocAsPdf(documentId: string, folderId: string, pdfName: string): Promise<{ pdfId: string; webViewLink: string; }> {
    const drive = getDriveClient();
    const pdfContent = await drive.files.export({ fileId: documentId, mimeType: 'application/pdf' }, { responseType: 'arraybuffer' });

    const pdfFile = await drive.files.create({
        requestBody: {
            name: pdfName,
            parents: [folderId],
            mimeType: 'application/pdf',
        },
        media: {
            mimeType: 'application/pdf',
            body: Buffer.from(pdfContent.data as any, 'binary'),
        },
        fields: 'id,webViewLink',
    });

    return { pdfId: pdfFile.data.id!, webViewLink: pdfFile.data.webViewLink! };
}

export async function deleteFile(fileId: string): Promise<void> {
    const drive = getDriveClient();
    await drive.files.delete({ fileId });
}

export async function createOfferPdf(projectId: string, customerName: string, offerTitle: string, offerHtml: string): Promise<string> {
    // 1. Hitta eller skapa rätt mappstruktur
    const offerFolderId = await getProjectFolderId(projectId, customerName);

    // 2. Skapa ett temporärt Google Doc från HTML-mallen
    const tempDocId = await createDocumentFromTemplate(offerTitle, offerHtml);

    try {
        // 3. Exportera dokumentet som en PDF i rätt mapp
        const pdfFileName = `${offerTitle.replace(/ /g, '_')}.pdf`;
        const { webViewLink } = await exportDocAsPdf(tempDocId, offerFolderId, pdfFileName);
        return webViewLink;
    } finally {
        // 4. Städa undan det temporära Google Doc-dokumentet, oavsett om exporten lyckades eller ej
        await deleteFile(tempDocId);
    }
}
