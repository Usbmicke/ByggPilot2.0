
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getInvoiceFromFirestore, updateInvoiceStatusInFirestore } from '@/services/firestoreService';
import { getProject } from '@/services/projectService';
import { InvoicePdfTemplate } from '@/components/pdf/InvoicePdfTemplate';
import { renderToBuffer } from '@react-pdf/renderer';

// TODO: Importera och konfigurera en e-posttjänst som t.ex. Resend eller Nodemailer
// import { resend } from '@/lib/email';

interface SendEmailRequestBody {
    to: string;
    subject: string;
    message: string;
}

/**
 * API-rutt för att skicka en faktura som PDF via e-post.
 */
export async function POST(req: NextRequest, { params }: { params: { projectId: string; invoiceId: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { projectId, invoiceId } = params;

    if (!userId) {
        return new NextResponse('Autentisering krävs', { status: 401 });
    }

    try {
        const { to, subject, message } = await req.json() as SendEmailRequestBody;
        if (!to || !subject || !message) {
            return new NextResponse('Mottagare, ämne och meddelande krävs', { status: 400 });
        }

        // 1. Verifiera åtkomst och hämta data
        const project = await getProject(projectId, userId);
        if (!project) { return new NextResponse('Projektet hittades inte', { status: 404 }); }

        const invoice = await getInvoiceFromFirestore(projectId, invoiceId);
        if (!invoice) { return new NextResponse('Fakturan hittades inte', { status: 404 }); }

        // 2. Generera PDF:en i minnet
        const pdfBuffer = await renderToBuffer(<InvoicePdfTemplate invoice={invoice} />);

        // 3. Skicka e-post med PDF som bilaga
        // --- Denna del är en simulation tills en e-posttjänst är konfigurerad ---
        console.log(`SIMULERING: Skickar e-post till ${to}`);
        console.log(`Ämne: ${subject}`);
        console.log(`Meddelande: ${message}`);
        console.log(`Bilaga: faktura-${invoice.id.substring(0, 8)}.pdf (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
        /*
        await resend.emails.send({
            from: 'ByggPilot <faktura@byggpilot.se>', // TODO: Hämta från inställningar
            to: to,
            subject: subject,
            html: message.replace(/\n/g, '<br>'),
            attachments: [
                {
                    filename: `faktura-${invoice.id.substring(0, 8)}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });
        */
        // --- Slut på simulation ---

        // 4. Uppdatera fakturastatus i databasen
        await updateInvoiceStatusInFirestore(projectId, invoiceId, 'Skickad');

        return NextResponse.json({ success: true, message: 'Fakturan har skickats och markerats som Skickad.' });

    } catch (error) {
        console.error(`Fel vid skickande av faktura ${invoiceId}:`, error);
        return new NextResponse('Internt serverfel vid skickande av e-post', { status: 500 });
    }
}
