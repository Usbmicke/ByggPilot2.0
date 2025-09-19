import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { firestore } from '@/app/lib/firebase/server';
import { getAuthenticatedClient } from '@/app/lib/google/auth';
import { google, drive_v3 } from 'googleapis';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Hämtar nästa tillgängliga projektnummer för en specifik användare.
 */
async function getNextProjectNumber(userId: string): Promise<number> {
    const projectsCollection = firestore.collection('projects');
    const snapshot = await projectsCollection.where('userId', '==', userId).orderBy('projectNumber', 'desc').limit(1).get();
    
    if (snapshot.empty) {
        return 1;
    }
    
    const lastProject = snapshot.docs[0].data();
    return (lastProject.projectNumber || 0) + 1;
}

/**
 * Hittar en mapp med ett specifikt namn inuti en föräldermapp, eller skapar den om den inte finns.
 * Returnerar ID för mappen.
 */
async function findOrCreateFolder(drive: drive_v3.Drive, name: string, parentId: string): Promise<string> {
    const query = `name = '${name}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    
    const res = await drive.files.list({ q: query, fields: 'files(id, name)' });

    if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id!;
    }

    const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
    };
    const folder = await drive.files.create({ requestBody: fileMetadata, fields: 'id' });
    return folder.data.id!;
}

// =======================
// HUVUD API-FUNKTION (POST)
// =======================
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Autentisering krävs.' }, { status: 401 });
    }

    try {
        const { projectName, clientName } = await req.json();
        if (!projectName || !clientName) {
            return NextResponse.json({ error: 'Projektnamn och kundnamn krävs.' }, { status: 400 });
        }

        const userId = session.user.id;
        const userDoc = await firestore.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userDoc.exists || !userData) {
             return NextResponse.json({ error: 'Användaren finns inte.' }, { status: 404 });
        }

        if (!userData.driveRootFolderId) {
            return NextResponse.json({ error: 'Google Drive-integrationen är inte slutförd. Huvudmapp saknas.' }, { status: 400 });
        }

        // 1. Skapa projektdata i Firestore
        const projectNumber = await getNextProjectNumber(userId);
        const newProjectData = {
            userId,
            projectName,
            clientName,
            projectNumber,
            status: 'Offert' as const,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            driveFolderId: '' // Temporär platshållare
        };

        const projectRef = await firestore.collection('projects').add(newProjectData);

        // 2. Skapa mappstruktur i Google Drive
        const drive = await getAuthenticatedClient(session) as drive_v3.Drive;
        const projectsParentFolderId = await findOrCreateFolder(drive, '2. Pågående Projekt', userData.driveRootFolderId);
        const projectFolderName = `${projectNumber} - ${projectName}`.replace(/[/\?%*:|"<>]/g, '-'); // Ta bort ogiltiga tecken
        
        const projectFolder = await drive.files.create({
            requestBody: {
                name: projectFolderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [projectsParentFolderId]
            },
            fields: 'id'
        });

        const driveFolderId = projectFolder.data.id;

        // 3. Uppdatera projektet med Drive-mappens ID
        if (driveFolderId) {
            await projectRef.update({ driveFolderId });
        } else {
            throw new Error('Misslyckades med att skapa Google Drive-mapp.');
        }

        return NextResponse.json({ success: true, projectId: projectRef.id });

    } catch (error) {
        console.error("Fel vid skapande av projekt:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ett okänt serverfel inträffade.';
        return NextResponse.json({ error: 'Kunde inte skapa projekt', details: errorMessage }, { status: 500 });
    }
}
