
import { NextResponse } from 'next/server';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/server';
import { getNextProjectNumber } from '@/services/projectService';
import { createFolder } from '@/lib/google'; // IMPORTERA GOOGLE-FUNKTIONEN
import { getGoogleDriveTokens } from '@/services/userService';

export async function POST(request: Request) {
    const { customer, userId } = await request.json();

    if (!customer || !userId) {
        return new NextResponse(JSON.stringify({ error: 'Kund och Användar-ID krävs' }), { status: 400 });
    }

    try {
        // Steg 1: Hämta användarens data, inklusive parent folder ID
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return new NextResponse(JSON.stringify({ error: 'Användaren hittades inte.' }), { status: 404 });
        }
        const userData = userDoc.data();
        const driveParentFolderId = userData.driveParentFolderId;

        if (!driveParentFolderId) {
             return new NextResponse(JSON.stringify({ error: 'Google Drive-integrationen är inte slutförd. Ingen rotmapp angiven.' }), { status: 400 });
        }

        // Hämta Google-tokens för anrop
        const tokens = await getGoogleDriveTokens(userId);
        if (!tokens) {
            return new NextResponse(JSON.stringify({ error: 'Kunde inte hämta Google Drive-autentisering.' }), { status: 401 });
        }

        // Steg 2: Skapa projektet i Firestore
        const projectNumber = await getNextProjectNumber(userId); 
        const projectId = doc(collection(db, `users/${userId}/projects`)).id;
        const projectDocRef = doc(db, `users/${userId}/projects`, projectId);
        
        const projectName = `Offert för ${customer.name}`;
        const folderName = `${projectNumber} - ${projectName}`;

        const initialProjectData = {
            id: projectId,
            projectNumber,
            name: projectName,
            customerId: customer.id,
            customerName: customer.name,
            ownerId: userId,
            status: 'offer',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            address: customer.address || '',
            googleDriveFolderId: null, // Sätts till null initialt
        };

        await setDoc(projectDocRef, initialProjectData);

        // Steg 3: Skapa mappen i Google Drive
        const folder = await createFolder(tokens, folderName, driveParentFolderId);
        const googleDriveFolderId = folder.id;

        if (!googleDriveFolderId) {
            throw new Error('Misslyckades med att skapa mapp i Google Drive.');
        }

        // Steg 4: Uppdatera projektet med Google Drive-mappens ID
        await updateDoc(projectDocRef, {
            googleDriveFolderId: googleDriveFolderId,
        });

        console.log(`[API] Offert-projekt skapat. ID: ${projectId}. Drive Mapp ID: ${googleDriveFolderId}`);

        return new NextResponse(JSON.stringify({ projectId: projectId, projectNumber: projectNumber }), { status: 200 });

    } catch (error) {
        console.error("[API] Fel vid skapande av offert-projekt:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new NextResponse(JSON.stringify({ error: 'Internt serverfel', details: errorMessage }), { status: 500 });
    }
}
