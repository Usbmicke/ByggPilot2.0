
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { firestoreAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createFolder, createGoogleDoc } from '@/services/driveService';

const createAtaSchema = z.object({
    title: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.projectId;
    if (!projectId) {
        return NextResponse.json({ error: 'Projekt-ID saknas' }, { status: 400 });
    }

    try {
        const json = await request.json();
        const body = createAtaSchema.parse(json);

        const projectRef = firestoreAdmin.collection('users').doc(userId).collection('projects').doc(projectId);

        const newAta = await firestoreAdmin.runTransaction(async (transaction) => {
            const projectDoc = await transaction.get(projectRef);
            if (!projectDoc.exists) {
                throw new Error('Projektet hittades inte.');
            }
            const projectData = projectDoc.data();

            // Hämta ID för "2_Ekonomi"
            const ekonomiFolderId = projectData?.googleDrive?.subFolderIds?.ekonomi;
            if (!ekonomiFolderId) {
                throw new Error('Mappen \"2_Ekonomi\" kunde inte hittas för detta projekt. Kör \"Verifiera & Reparera\".');
            }

            let ataParentFolderId = projectData?.googleDrive?.subFolderIds?.ata; // ÄTA-specifik mapp
            const updates: { [key: string]: any } = {};

            // Om ÄTA-mappen inte finns, skapa den och förbered uppdatering av projektet
            if (!ataParentFolderId) {
                const ataFolder = await createFolder(userId, 'ÄTA', ekonomiFolderId);
                if (!ataFolder || !ataFolder.id) {
                    throw new Error('Kunde inte skapa mappen \"ÄTA\" i projektets ekonomimapp.');
                }
                ataParentFolderId = ataFolder.id;
                updates['googleDrive.subFolderIds.ata'] = ataParentFolderId;
            }

            const nextAtaNumber = (projectData?.ataCounter || 0) + 1;
            updates['ataCounter'] = nextAtaNumber;
            
            const ataTitle = body.title || `ÄTA-underlag ${nextAtaNumber}`;
            const documentName = `ÄTA ${String(nextAtaNumber).padStart(2, '0')} - ${ataTitle}`;

            // Skapa ett Google-dokument, inte en mapp
            const ataDoc = await createGoogleDoc(userId, documentName, ataParentFolderId);
            if (!ataDoc || !ataDoc.id) {
                throw new Error('Misslyckades med att skapa ÄTA-dokumentet i Google Drive.');
            }
            
            const newAtaRef = projectRef.collection('atas').doc();
            const newAtaData = {
                id: newAtaRef.id,
                ataNumber: nextAtaNumber,
                title: ataTitle,
                notes: body.notes || '',
                status: 'DRAFT',
                googleDriveDocId: ataDoc.id, // Spara dokument-ID, inte mapp-ID
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            };

            transaction.set(newAtaRef, newAtaData);
            transaction.update(projectRef, updates);

            return newAtaData;
        });
        
        console.log(`[Guldstandard] Nytt ÄTA-dokument skapat. Projekt: ${projectId}, ÄTA-ID: ${newAta.id}, Drive-dokument: ${newAta.googleDriveDocId}`);

        return NextResponse.json(newAta, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
        }
        console.error('Fel vid skapande av ÄTA:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
