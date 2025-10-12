
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { listInvoicesForProjectFromFirestore, createInvoiceInFirestore } from '@/services/firestoreService';
import { getProject } from '@/services/projectService';
import { Invoice } from '@/types/index';

/**
 * API-rutt för att hämta alla fakturor för ett projekt.
 */
export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { projectId } = params;

    if (!userId) {
        return NextResponse.json({ message: 'Autentisering krävs' }, { status: 401 });
    }

    try {
        // Verifiera att användaren har åtkomst till projektet
        const project = await getProject(projectId, userId);
        if (!project) {
            return NextResponse.json({ message: 'Åtkomst nekad eller så finns inte projektet' }, { status: 403 });
        }

        const invoices = await listInvoicesForProjectFromFirestore(projectId);
        return NextResponse.json(invoices, { status: 200 });

    } catch (error) {
        console.error(`Fel vid hämtning av fakturor för projekt ${projectId}:`, error);
        return NextResponse.json({ message: 'Internt serverfel' }, { status: 500 });
    }
}

/**
 * API-rutt för att skapa ett nytt fakturaunderlag för ett projekt.
 */
export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { projectId } = params;

    if (!userId) {
        return NextResponse.json({ message: 'Autentisering krävs' }, { status: 401 });
    }

    try {
        const project = await getProject(projectId, userId);
        if (!project) {
            return NextResponse.json({ message: 'Åtkomst nekad eller så finns inte projektet' }, { status: 403 });
        }

        const invoiceData = (await req.json()) as Omit<Invoice, 'id'>;
        
        // Validering av indata kan läggas till här

        const newInvoice = await createInvoiceInFirestore(projectId, invoiceData);
        return NextResponse.json(newInvoice, { status: 201 }); // 201 Created

    } catch (error) {
        console.error(`Fel vid skapande av faktura för projekt ${projectId}:`, error);
        return NextResponse.json({ message: 'Internt serverfel' }, { status: 500 });
    }
}
