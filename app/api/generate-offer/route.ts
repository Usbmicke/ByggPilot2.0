
import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { firestore as db } from '@/app/lib/firebase/server';
import { createOfferPdf } from '@/app/lib/google/driveService';
import { OFFERTMALL_HTML } from '@/app/lib/google/offertmall';
import { Calculation, CalculationItem, CalculationCategory } from '@/app/types/calculation';
import { Project } from '@/app/types/project';
import Handlebars from 'handlebars';

// Hjälpfunktion för att formatera nummer som valuta
const formatCurrency = (amount: number) => new Intl.NumberFormat('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

export async function POST(request: Request) {
    const { projectId } = await request.json();

    if (!projectId) {
        return new NextResponse('Projekt-ID saknas', { status: 400 });
    }

    try {
        // 1. Hämta data
        const projectDocRef = doc(db, 'projects', projectId);
        const calcDocRef = doc(db, 'projects', projectId, 'calculations', 'main');
        const [projectDoc, calculationDoc] = await Promise.all([ getDoc(projectDocRef), getDoc(calcDocRef) ]);

        if (!projectDoc.exists() || !calculationDoc.exists()) {
            return new NextResponse('Projekt- eller kalkyldata kunde inte hittas', { status: 404 });
        }

        const project = projectDoc.data() as Project;
        const calculation = calculationDoc.data() as Calculation;

        // 2. Förbered data för mallen
        const today = new Date();
        const validUntil = new Date();
        validUntil.setDate(today.getDate() + 30);

        const totalSelfCost = calculation.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const profitAmount = totalSelfCost * (calculation.profitMarginPercentage / 100);
        const totalExclVat = totalSelfCost + profitAmount;
        const vatAmount = totalExclVat * 0.25;
        const totalInclVat = totalExclVat + vatAmount;

        const sections: { title: CalculationCategory, items: any[], subTotal: string }[] = ['Material', 'Arbete', 'Underentreprenör', 'Övrigt'].map(category => {
            const items = calculation.items
                .filter(item => item.category === category)
                .map(item => ({
                    ...item,
                    unitPrice: formatCurrency(item.unitPrice),
                    total: formatCurrency(item.quantity * item.unitPrice)
                }));
            const subTotal = items.reduce((acc, item) => acc + (item.quantity * parseFloat(item.unitPrice.replace(/\s/g, '').replace(',', '.'))), 0);
            return {
                title: category as CalculationCategory,
                items: items,
                subTotal: formatCurrency(subTotal)
            };
        }).filter(section => section.items.length > 0); // Inkludera bara sektioner med innehåll

        const templateData = {
            // Företagsinfo (bör hämtas från inställningar framöver)
            dittForetagsnamn: process.env.COMPANY_NAME || 'Företagsnamn saknas',
            dinAdress: process.env.COMPANY_ADDRESS || 'Adress saknas',
            dinEpost: process.env.COMPANY_EMAIL || 'E-post saknas',
            dittTelefonnummer: process.env.COMPANY_PHONE || 'Telefon saknas',
            dittOrgNr: process.env.COMPANY_ORG_NR || 'Org.nr saknas',
            dittNamn: process.env.USER_NAME || 'Ditt Namn',

            // Offertinfo
            offertdatum: today.toLocaleDateString('sv-SE'),
            giltigTillDatum: validUntil.toLocaleDateString('sv-SE'),
            offertnummer: `${today.getFullYear()}-${project.projectNumber}`,

            // Kund- & Projektinfo
            kundnamn: project.customer.name,
            kundAdress: project.customer.address,
            kundEpost: project.customer.email,
            projektnummer: project.projectNumber,
            
            // Kalkyl-data
            sections,
            totalSelfCost: formatCurrency(totalSelfCost),
            profitMarginPercentage: calculation.profitMarginPercentage,
            profitAmount: formatCurrency(profitAmount),
            totalExclVat: formatCurrency(totalExclVat),
            vatAmount: formatCurrency(vatAmount),
            totalInclVat: formatCurrency(totalInclVat),
        };

        // 3. Fyll i mallen
        Handlebars.registerHelper('each', function(context, options) {
            let ret = "";
            for(let i=0, j=context.length; i<j; i++) {
                ret = ret + options.fn(context[i]);
            }
            return ret;
        });
        const template = Handlebars.compile(OFFERTMALL_HTML);
        const finalHtml = template(templateData);

        // 4. Skapa PDF
        const offerTitle = `Offert ${project.projectNumber}`;
        const pdfUrl = await createOfferPdf(projectId, project.customer.name, offerTitle, finalHtml);

        console.log(`[API] PDF skapad. URL: ${pdfUrl}`);

        // 5. Returnera URL
        return NextResponse.json({ pdfUrl });

    } catch (error) {
        console.error("[API] Fel vid PDF-generering:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new NextResponse(JSON.stringify({ error: 'Internt serverfel', details: errorMessage }), { status: 500 });
    }
}
