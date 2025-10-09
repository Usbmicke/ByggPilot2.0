
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getInvoiceFromFirestore } from '@/services/firestoreService';
import { getProject } from '@/services/projectService';
import { InvoicePdfTemplate } from '@/components/pdf/InvoicePdfTemplate';
import { renderToStream } from '@react-pdf/renderer';

/**
 * API-rutt för att generera en PDF-version av en specifik faktura.
 */
export async function GET(req: NextRequest, { params }: { params: { projectId: string; invoiceId: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { projectId, invoiceId } = params;

    if (!userId) {
        return new NextResponse('Autentisering krävs', { status: 401 });
    }

    try {
        // 1. Verifiera åtkomst till projektet
        const project = await getProject(projectId, userId);
        if (!project) {
            return new NextResponse('Åtkomst nekad eller så finns inte projektet', { status: 403 });
        }

        // 2. Hämta den specifika fakturan
        const invoice = await getInvoiceFromFirestore(projectId, invoiceId);
        if (!invoice) {
            return new NextResponse('Fakturan kunde inte hittas', { status: 404 });
        }

        // 3. Rendera PDF:en till en ström
        const pdfStream = await renderToStream(<InvoicePdfTemplate invoice={invoice} />);

        // 4. Skicka tillbaka PDF-strömmen som svar
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="faktura-${invoice.id.substring(0,8)}.pdf"`);

        return new NextResponse(pdfStream, { status: 200, headers });

    } catch (error) {
        console.error(`Fel vid generering av PDF för faktura ${invoiceId}:`, error);
        return new NextResponse('Internt serverfel vid PDF-generering', { status: 500 });
    }
}
