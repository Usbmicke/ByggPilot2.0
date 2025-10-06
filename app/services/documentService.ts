
import { docs_v1, drive_v3 } from 'googleapis';
import { RiskAnalysis } from './aiService';

/**
 * Bygger en array av Google Docs API-requests för att strukturera innehållet i en riskanalys.
 * @param analysis Datan för riskanalysen.
 * @param projectName Namnet på projektet.
 * @param isUpdate Anger om det är en uppdatering, vilket ändrar titeln.
 * @returns En array med request-objekt för batchUpdate.
 */
const buildRiskAnalysisContentRequests = (
    analysis: RiskAnalysis,
    projectName: string,
    isUpdate: boolean
): docs_v1.Schema$Request[] => {
    const requests: docs_v1.Schema$Request[] = [];
    let index = 1; // Startindex för innehåll i ett Google-dokument

    const insertText = (text: string, style?: docs_v1.Schema$ParagraphStyle) => {
        requests.push({ insertText: { location: { index }, text } });
        if (style) {
            requests.push({
                updateParagraphStyle: {
                    range: { startIndex: index, endIndex: index + text.length },
                    paragraphStyle: style,
                    fields: 'namedStyleType'
                }
            });
        }
        index += text.length;
    };

    // 1. Infoga Titel, Projektinfo och Sammanfattning
    insertText(`Riskanalys${isUpdate ? ' (Uppdaterad)' : ''}\n`, { namedStyleType: 'TITLE' });
    insertText(`Projekt: ${projectName}\n\n`, { namedStyleType: 'SUBTITLE' });
    insertText(`Sammanfattning - Kritiska Risker\n`, { namedStyleType: 'HEADING_1' });
    insertText(`${analysis.summary}\n\n`);
    insertText(`Fullständig Riskanalys\n`, { namedStyleType: 'HEADING_1' });

    // 2. Infoga Tabell för risker
    const numRows = analysis.risks.length + 1;
    requests.push({ insertTable: { rows: numRows, columns: 4, location: { index } } });
    
    // Indexet måste nu flyttas in i den första cellen i tabellen.
    // Varje tabell, rad och cell upptar tecken i dokumentstrukturen.
    // Att hoppa till första cellen är +2 från startindex för tabellen.
    index += 2;

    // 3. Fyll tabellen med rubriker och data
    const headers = ['Område', 'Riskmoment', 'Konsekvens', 'Förebyggande/Hanterande Åtgärd'];
    for (const header of headers) {
        requests.push({ insertText: { text: header, location: { index } } });
        index += header.length + 2; // Flytta till nästa cell
    }

    for (const risk of analysis.risks) {
        const rowData = [risk.area, risk.description, risk.consequence, risk.measure];
        for (const cellData of rowData) {
            requests.push({ insertText: { text: cellData, location: { index } } });
            index += cellData.length + 2; // Flytta till nästa cell
        }
    }

    return requests;
};


/**
 * Skapar det initiala Google Doc-dokumentet för en riskanalys.
 */
export async function createRiskAnalysisDocument(
    drive: drive_v3.Drive,
    docs: docs_v1.Docs,
    folderId: string,
    projectName: string,
    analysis: RiskAnalysis
): Promise<{ fileId: string; documentUrl: string }> {
    // 1. Skapa ett tomt dokument i Google Drive för att få ett ID
    const fileMetadata = {
        name: `Riskanalys - ${projectName}`,
        mimeType: 'application/vnd.google-apps.document',
        parents: [folderId],
    };

    const newDoc = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
    });

    const documentId = newDoc.data.id;
    if (!documentId) {
        throw new Error("Kunde inte skapa Google Doc-filen.");
    }

    // 2. Bygg upp innehållet
    const requests = buildRiskAnalysisContentRequests(analysis, projectName, false);

    // 3. Fyll dokumentet med innehållet
    await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests },
    });

    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    return { fileId: documentId, documentUrl };
}

/**
 * Raderar allt innehåll i ett befintligt Google-dokument och skriver in den nya riskanalysen.
 */
export async function updateRiskAnalysisDocument(
    docs: docs_v1.Docs,
    documentId: string,
    analysis: RiskAnalysis,
    projectName: string
): Promise<void> {
    // 1. Hämta dokumentet för att hitta längden på befintligt innehåll.
    const doc = await docs.documents.get({ documentId, fields: 'body.content' });
    const content = doc.data.body?.content;
    const lastElement = content?.[content.length - 1];
    const existingContentLength = lastElement?.endIndex ?? 0;

    const requests: docs_v1.Schema$Request[] = [];

    // 2. Skapa en request för att radera allt befintligt innehåll (om det finns något).
    // Vi börjar på 1 för att inte ta bort det första, osynliga stycketecknet.
    if (existingContentLength > 1) {
        requests.push({
            deleteContentRange: {
                range: {
                    startIndex: 1,
                    endIndex: existingContentLength - 1, // Lämna den sista radbrytningen
                },
            },
        });
    }

    // 3. Bygg det nya innehållet och lägg till i samma batch-anrop.
    const newContentRequests = buildRiskAnalysisContentRequests(analysis, projectName, true);
    requests.push(...newContentRequests);

    // 4. Utför den kombinerade batch-uppdateringen.
    await docs.documents.batchUpdate({ documentId, requestBody: { requests } });
}


// --- Platzhållarfunktioner --- //

export async function moveDocument(drive: drive_v3.Drive, fileId: string, newFolderId: string): Promise<void> {
    // Implementation saknas i originalfilen
    console.warn(`Funktionen 'moveDocument' är inte implementerad.`);
}

export async function createQuoteDocument(): Promise<{ fileId: string; documentUrl: string }> {
     // Implementation saknas i originalfilen
    console.warn(`Funktionen 'createQuoteDocument' är inte implementerad.`);
    return { fileId: 'dummy-id', documentUrl: '' };
}

