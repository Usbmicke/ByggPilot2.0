
import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/services/firestoreService'; // GULDSTANDARD: Korrekt, centraliserad DB-instans
import { createOfferPdf } from '@/app/lib/google/driveService';
import { OFFERTMALL_HTML } from '@/app/lib/google/offertmall';
import { Calculation, CalculationItem, CalculationCategory } from '@/app/types/calculation';
import { Project } from '@/app/types/project';
import Handlebars from 'handlebars';

const formatCurrency = (amount: number) => new Intl.NumberFormat('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

export async function POST(request: Request) {
    // --- GULDSTANDARD SÄKERHETSÅTGÄRD ---
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.uid) {
        return new NextResponse(JSON.stringify({ error: "Autentisering krävs." }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userId = session.user.uid;

    const { projectId } = await request.json();

    if (!projectId) {
        return new NextResponse('Projekt-ID saknas', { status: 400 });
    }

    try {
        // --- GULDSTANDARD ÄGARSKAPSKONTROLL ---
        const projectDocRef = doc(db, 'users', userId, 'projects', projectId);
        const projectDoc = await getDoc(projectDocRef);

        if (!projectDoc.exists()) {
            return new NextResponse('Åtkomst nekad eller projektet existerar inte.', { status: 403 });
        }
        // --- SLUT PÅ ÄGARSKAPSKONTROLL ---

        const calcDocRef = doc(db, 'users', userId, 'projects', projectId, 'calculations', 'main');
        const calculationDoc = await getDoc(calcDocRef);

        if (!calculationDoc.exists()) {
            return new NextResponse('Kalkyldata kunde inte hittas för projektet', { status: 404 });
        }

        const project = projectDoc.data() as Project;
        const calculation = calculationDoc.data() as Calculation;

        // Resten av funktionen förblir densamma...
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
        }).filter(section => section.items.length > 0);

        const templateData = {
            dittForetagsnamn: process.env.COMPANY_NAME || 'Företagsnamn saknas',
            dinAdress: process.env.COMPANY_ADDRESS || 'Adress saknas',
            dinEpost: process.env.COMPANY_EMAIL || 'E-post saknas',
            dittTelefonnummer: process.env.COMPANY_PHONE || 'Telefon saknas',
            dittOrgNr: process.env.COMPANY_ORG_NR || 'Org.nr saknas',
            dittNamn: session.user.name || 'Användarnamn saknas', // GULDSTANDARD: Hämta namn från session

            offertdatum: today.toLocaleDateString('sv-SE'),
            giltigTillDatum: validUntil.toLocaleDateString('sv-SE'),
            offertnummer: `${today.getFullYear()}-${project.projectNumber || projectId}`,

            kundnamn: project.customer?.name || 'Kundnamn saknas',
            kundAdress: project.customer?.address || 'Kundadress saknas',
            kundEpost: project.customer?.email || 'Kund-epost saknas',
            projektnummer: project.projectNumber || projectId,
            
            sections,
            totalSelfCost: formatCurrency(totalSelfCost),
            profitMarginPercentage: calculation.profitMarginPercentage,
            profitAmount: formatCurrency(profitAmount),
            totalExclVat: formatCurrency(totalExclVat),
            vatAmount: formatCurrency(vatAmount),
            totalInclVat: formatCurrency(totalInclVat),
        };

        Handlebars.registerHelper('each', function(context, options) {
            let ret = "";
            for(let i=0, j=context.length; i<j; i++) {
                ret = ret + options.fn(context[i]);
            }
            return ret;
        });
        const template = Handlebars.compile(OFFERTMALL_HTML);
        const finalHtml = template(templateData);

        const offerTitle = `Offert ${project.projectNumber || projectId}`;
        const pdfUrl = await createOfferPdf(projectId, project.customer.name, offerTitle, finalHtml);

        console.log(`[API] PDF skapad. URL: ${pdfUrl}`);

        return NextResponse.json({ pdfUrl });

    } catch (error) {
        console.error("[API] Fel vid PDF-generering:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new NextResponse(JSON.stringify({ error: 'Internt serverfel', details: errorMessage }), { status: 500 });
    }
}
