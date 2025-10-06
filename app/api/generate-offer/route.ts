
import { NextResponse } from 'next/server';
import { doc, getDoc, collection } from 'firebase/firestore';
import { firestoreAdmin as db } from '@/lib/firebase-admin'; // KORRIGERAD SÖKVÄG
import { renderToStaticMarkup } from 'react-dom/server';
import { InvoicePdfTemplate } from '@/components/pdf/InvoicePdfTemplate';
import { uploadPdfToDrive } from '@/services/driveService';
import { getGoogleDriveTokens } from '@/services/userService';
import { Project } from '@/types/project';
import { Customer } from '@/types/customer';
import { Calculation } from '@/types/calculation';
import { Company } from '@/types/company';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const formatCurrency = (amount: number) => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);

export async function POST(request: Request) {
    const { projectId, userId } = await request.json();

    if (!projectId || !userId) {
        return new NextResponse(JSON.stringify({ error: 'Projekt-ID och Användar-ID saknas' }), { status: 400 });
    }

    try {
        // Steg 1: Hämta all nödvändig data från Firestore
        const userDocRef = doc(db, 'users', userId);
        const projectDocRef = doc(db, `users/${userId}/projects`, projectId);
        const calcDocRef = doc(db, `users/${userId}/projects/${projectId}/calculations`, 'main');
        
        const [userDoc, projectDoc, calculationDoc] = await Promise.all([
            getDoc(userDocRef),
            getDoc(projectDoc),
            getDoc(calcDocRef)
        ]);

        if (!userDoc.exists() || !projectDoc.exists() || !calculationDoc.exists()) {
            let missing = [];
            if (!userDoc.exists()) missing.push('användare');
            if (!projectDoc.exists()) missing.push('projekt');
            if (!calculationDoc.exists()) missing.push('kalkyl');
            return new NextResponse(JSON.stringify({ error: `Nödvändig data kunde inte hittas: ${missing.join(', ')}` }), { status: 404 });
        }

        const companyData = userDoc.data() as Company;
        const project = projectDoc.data() as Project;
        const calculation = calculationDoc.data() as Calculation;
        
        const customerDocRef = doc(db, `users/${userId}/customers`, project.customerId);
        const customerDoc = await getDoc(customerDocRef);
        if(!customerDoc.exists()) {
             return new NextResponse(JSON.stringify({ error: 'Kunddata kunde inte hittas' }), { status: 404 });
        }
        const customer = customerDoc.data() as Customer;

        const googleDriveFolderId = project.googleDriveFolderId;
        if (!googleDriveFolderId) {
            return new NextResponse(JSON.stringify({ error: 'Projektet saknar en Google Drive-mapp. Kan inte spara PDF.' }), { status: 400 });
        }

        // Steg 2: Gör beräkningar och förbered data för PDF-mallen
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
        
        // Steg 3: Generera HTML från React-komponent
        const htmlContent = renderToStaticMarkup(<InvoicePdfTemplate {...templateData} />);

        // Steg 4: Generera PDF från HTML
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless, 
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        
        // Steg 5: Ladda upp PDF till Google Drive
        const tokens = await getGoogleDriveTokens(userId);
        if (!tokens) {
            return new NextResponse(JSON.stringify({ error: 'Kunde inte hämta Google-autentisering.' }), { status: 401 });
        }

        const pdfFileName = `Offert ${project.projectNumber} - ${customer.name}.pdf`;
        const file = await uploadPdfToDrive(tokens, pdfBuffer, pdfFileName, googleDriveFolderId);
        const pdfUrl = file.webViewLink; // Länk för att se filen i webbläsare

        console.log(`[API] PDF skapad och uppladdad. URL: ${pdfUrl}`);

        // Steg 6: Returnera URL till den uppladdade filen
        return new NextResponse(JSON.stringify({ pdfUrl: pdfUrl }), { status: 200 });

    } catch (error) {
        console.error("[API] Fel vid PDF-generering:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new NextResponse(JSON.stringify({ error: 'Internt serverfel vid PDF-generering', details: errorMessage }), { status: 500 });
    }
}
