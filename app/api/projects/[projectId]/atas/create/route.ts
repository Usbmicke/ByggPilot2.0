
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { z } from 'zod';
import { adminDb } from '@/lib/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createSingleFolder, createGoogleDocFromTemplate } from '@/services/driveService';
import logger from '@/lib/logger';

const createAtaSchema = z.object({
    title: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.accessToken) {
        return NextResponse.json({ error: 'Unauthorized - Session or token missing' }, { status: 401 });
    }
    const userId = session.user.id;
    const accessToken = session.accessToken;

    const projectId = params.projectId;
    if (!projectId) {
        return NextResponse.json({ error: 'Projekt-ID saknas' }, { status: 400 });
    }

    const log = logger.child({ api: 'atas/create', projectId, userId });

    try {
        const json = await request.json();
        const body = createAtaSchema.parse(json);

        const projectRef = adminDb.collection('users').doc(userId).collection('projects').doc(projectId);

        const newAta = await adminDb.runTransaction(async (transaction) => {
            const projectDoc = await transaction.get(projectRef);
            if (!projectDoc.exists) {
                log.error('Projektet hittades inte.');
                throw new Error('Projektet hittades inte.');
            }
            const projectData = projectDoc.data();

            const userDoc = await adminDb.collection('users').doc(userId).get();
            const userData = userDoc.data();
            const ataTemplateDocId = userData?.documentTemplates?.ata;

            if (!ataTemplateDocId) {
                log.error('Standardmall för ÄTA saknas i användarinställningarna.');
                throw new Error('Du har inte angett en standardmall för ÄTA-dokument. Gå till dina inställningar.');
            }

            const ekonomiFolderId = projectData?.googleDrive?.subFolderIds?.economy;
            if (!ekonomiFolderId) {
                log.error('Mappen \"Ekonomi\" kunde inte hittas i Drive.');
                throw new Error('Mappen \"Ekonomi\" kunde inte hittas för detta projekt. Kör \"Verifiera & Reparera\".');
            }

            let ataParentFolderId = projectData?.googleDrive?.subFolderIds?.ata;
            const updates: { [key: string]: any } = {};

            if (!ataParentFolderId) {
                log.info('Skapar ÄTA-mapp då den inte finns.');
                const createdAtaFolderId = await createSingleFolder(accessToken, 'ÄTA', ekonomiFolderId);
                ataParentFolderId = createdAtaFolderId;
                updates['googleDrive.subFolderIds.ata'] = ataParentFolderId;
            }

            const nextAtaNumber = (projectData?.ataCounter || 0) + 1;
            updates['ataCounter'] = nextAtaNumber;
            
            const ataTitle = body.title || `ÄTA-underlag ${nextAtaNumber}`;
            const documentName = `ÄTA ${String(nextAtaNumber).padStart(2, '0')} - ${ataTitle}`;

            log.info({ documentName }, 'Skapar ÄTA-dokument från mall.');
            const ataDoc = await createGoogleDocFromTemplate(accessToken, ataTemplateDocId, documentName, ataParentFolderId);
            
            const newAtaRef = projectRef.collection('atas').doc();
            const newAtaData = {
                id: newAtaRef.id,
                ataNumber: nextAtaNumber,
                title: ataTitle,
                notes: body.notes || '',
                status: 'DRAFT',
                googleDriveDocId: ataDoc.id,
                googleDriveWebViewLink: ataDoc.webViewLink,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            };

            transaction.set(newAtaRef, newAtaData);
            transaction.update(projectRef, updates);

            return newAtaData;
        });
        
        log.info({ ataId: newAta.id, driveDocId: newAta.googleDriveDocId }, 'Nytt ÄTA-dokument skapat.');

        return NextResponse.json(newAta, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            log.warn({ error: error.errors }, 'Invalid input data.');
            return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
        }
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        log.error({ error: errorMessage, stack: error instanceof Error ? error.stack : undefined }, 'Fel vid skapande av ÄTA.');
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
