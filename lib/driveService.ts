
import { getDriveClient, getDocsClient } from '@/lib/google-server';
import { adminDb } from './admin';

const ROOT_FOLDER_NAME = 'ByggPilot - App';

async function findOrCreateFolder(drive: any, name: string, parentId?: string): Promise<string> {
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

export async function createInitialUserDriveStructure(userId: string, userDisplayName: string): Promise<{ rootFolderId: string, subFolderIds: { [key: string]: string } }> {
    const drive = await getDriveClient(userId);
    if (!drive) {
        throw new Error('Kunde inte skapa Google Drive-klient.');
    }

    const rootFolderName = `Företag - ${userDisplayName}`;
    const rootFolderId = await findOrCreateFolder(drive, rootFolderName);

    const subFolders = ['Avtal', 'Ekonomi', 'Bilder & Media', 'Projektplanering', 'Ritningar'];
    const subFolderIds: { [key: string]: string } = {};

    for (const folderName of subFolders) {
        const folderId = await findOrCreateFolder(drive, folderName, rootFolderId);
        subFolderIds[folderName.toLowerCase().replace(/ & /g, '_')] = folderId;
    }

    return { rootFolderId, subFolderIds };
}

export async function createInitialProjectStructure(userId: string, projectName: string): Promise<{ rootFolderId: string, subFolderIds: { [key: string]: string } }> {
    const drive = await getDriveClient(userId);
    if (!drive) {
        throw new Error('Kunde inte skapa Google Drive-klient.');
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData || !userData.driveRootFolderId) {
        throw new Error('Användarens rotmapp i Google Drive kunde inte hittas.');
    }

    const projectFolderId = await findOrCreateFolder(drive, projectName, userData.driveRootFolderId);

    const subFolders = ['Avtal', 'Ekonomi', 'Bilder & Media', 'Projektplanering', 'Ritningar', 'Tidsrapporter', 'ÄTA'];
    const subFolderIds: { [key: string]: string } = {};

    for (const folderName of subFolders) {
        const folderId = await findOrCreateFolder(drive, folderName, projectFolderId);
        subFolderIds[folderName.toLowerCase().replace(/ & /g, '_')] = folderId;
    }

    return { rootFolderId: projectFolderId, subFolderIds };
}

export async function createOfferPdfForProject(userId: string, projectId: string, offerData: any): Promise<string> {
    const drive = await getDriveClient(userId);
    if (!drive) {
        throw new Error('Kunde inte skapa Google Drive-klient.');
    }

    const projectDoc = await adminDb.collection('users').doc(userId).collection('projects').doc(projectId).get();
    const projectData = projectDoc.data();

    if (!projectData || !projectData.googleDrive || !projectData.googleDrive.subFolderIds || !projectData.googleDrive.subFolderIds.offerter) {
        throw new Error('Projektets offertmapp i Google Drive kunde inte hittas.');
    }

    const offerFolderId = projectData.googleDrive.subFolderIds.offerter;
    const htmlContent = "<h1>Offert</h1><p>Här är detaljerna...</p>"; // Generera HTML från offerData
    const docTitle = `Offert_${projectId}`;
    const docId = await createDocumentFromTemplate(userId, docTitle, htmlContent);
    const pdfFileName = `${docTitle}.pdf`;
    const { webViewLink } = await exportDocAsPdf(userId, docId, offerFolderId, pdfFileName);
    
    await deleteFile(userId, docId);

    return webViewLink;
}

async function createDocumentFromTemplate(userId: string, title: string, htmlContent: string): Promise<string> {
    const docs = await getDocsClient(userId);
    const drive = await getDriveClient(userId);
    if (!docs || !drive) {
        throw new Error('Kunde inte skapa Google-klienter.');
    }

    const document = await docs.documents.create({ requestBody: { title } });
    const documentId = document.data.documentId!;

    await drive.files.update({
        fileId: documentId,
        media: {
            mimeType: 'text/html',
            body: htmlContent,
        }
    });

    return documentId;
}

async function exportDocAsPdf(userId: string, documentId: string, folderId: string, pdfName: string): Promise<{ pdfId: string; webViewLink: string; }> {
    const drive = await getDriveClient(userId);
    if (!drive) {
        throw new Error('Kunde inte skapa Google Drive-klient.');
    }

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

async function deleteFile(userId: string, fileId: string): Promise<void> {
    const drive = await getDriveClient(userId);
    if (!drive) {
        throw new Error('Kunde inte skapa Google Drive-klient.');
    }
    await drive.files.delete({ fileId });
}
