
import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/admin';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePdfTemplate } from '@/components/pdf/InvoicePdfTemplate';
import { getDriveClient } from '@/lib/google';
import { Project } from '@/types/project';
import { Customer, Company } from '@/types/index';
import { Calculation } from '@/types/calculation';
import { Readable } from 'stream';

const formatCurrency = (amount: number) => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);

async function uploadPdfToDrive(userId: string, pdfBuffer: Buffer, fileName: string, folderId: string) {
    const drive = await getDriveClient(userId);
    if (!drive) {
        throw new Error('Kunde inte initialisera Google Drive-service.');
    }

    const media = {
        mimeType: 'application/pdf',
        body: Readable.from(pdfBuffer),
    };

    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading to Drive:', error);
        throw new Error('Misslyckades att ladda upp PDF till Google Drive.');
    }
}

export async function POST(request: Request) {
    const { projectId, userId } = await request.json();

    if (!projectId || !userId) {
        return new NextResponse(JSON.stringify({ error: 'Projekt-ID och Användar-ID saknas' }), { status: 400 });
    }

    try {
        const userDocRef = db.doc(`users/${userId}`);
        const projectDocRef = db.doc(`users/${userId}/projects/${projectId}`);
        const calcDocRef = db.doc(`users/${userId}/projects/${projectId}/calculations/main`);
        
        const [userDoc, projectDoc, calculationDoc] = await Promise.all([
            userDocRef.get(),
            projectDocRef.get(),
            calcDocRef.get()
        ]);

        if (!userDoc.exists || !projectDoc.exists || !calculationDoc.exists) {
            let missing = [];
            if (!userDoc.exists) missing.push('användare');
            if (!projectDoc.exists) missing.push('projekt');
            if (!calculationDoc.exists) missing.push('kalkyl');
            return new NextResponse(JSON.stringify({ error: `Nödvändig data kunde inte hittas: ${missing.join(', ')}` }), { status: 404 });
        }

        const companyData = userDoc.data() as Company;
        const project = projectDoc.data() as Project;
        const calculation = calculationDoc.data() as Calculation;
        
        const customerDocRef = db.doc(`users/${userId}/customers/${project.customerId}`);
        const customerDoc = await customerDocRef.get();
        if(!customerDoc.exists) {
             return new NextResponse(JSON.stringify({ error: 'Kunddata kunde inte hittas' }), { status: 404 });
        }
        const customer = customerDoc.data() as Customer;

        const googleDriveFolderId = project.googleDriveFolderId;
        if (!googleDriveFolderId) {
            return new NextResponse(JSON.stringify({ error: 'Projektet saknar en Google Drive-mapp. Kan inte spara PDF.' }), { status: 400 });
        }

        const totalSelfCost = calculation.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const profitAmount = totalSelfCost * (calculation.profitMarginPercentage / 100);
        const totalExclVat = totalSelfCost + profitAmount;
        const vatAmount = totalExclVat * 0.25;
        const totalInclVat = totalExclVat + vatAmount;

        const templateData = {
            project, 
            customer,
            calculation,
            company: companyData,
            totalSelfCost: formatCurrency(totalSelfCost),
            profitAmount: formatCurrency(profitAmount),
            totalExclVat: formatCurrency(totalExclVat),
            vatAmount: formatCurrency(vatAmount),
            totalInclVat: formatCurrency(totalInclVat),
            offertdatum: new Date().toLocaleDateString('sv-SE'),
            giltigTillDatum: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE'),
        };
        
        const pdfBuffer = await renderToBuffer(<InvoicePdfTemplate {...templateData} />);
        
        const pdfFileName = `Offert ${project.projectNumber} - ${customer.name}.pdf`;
        const file = await uploadPdfToDrive(userId, pdfBuffer, pdfFileName, googleDriveFolderId);
        const pdfUrl = file.webViewLink; 

        console.log(`[API] PDF skapad och uppladdad. URL: ${pdfUrl}`);

        return new NextResponse(JSON.stringify({ pdfUrl: pdfUrl }), { status: 200 });

    } catch (error) {
        console.error("[API] Fel vid PDF-generering:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new NextResponse(JSON.stringify({ error: 'Internt serverfel vid PDF-generering', details: errorMessage }), { status: 500 });
    }
}
