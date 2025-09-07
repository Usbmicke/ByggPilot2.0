
import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { createProjectFolder } from '@/app/services/driveService'; // Importera den nya servicen
import { getSession } from '@/app/lib/session';
import { Project } from '@/app/types';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const { name, customerId, customerName, status } = await request.json();

    if (!name || !customerId || !customerName || !status) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    // Steg 1: Skapa projektet i Firestore för att få ett ID
    const projectDocRef = await addDoc(collection(db, "projects"), {
      name,
      customerId,
      customerName,
      status,
      driveFolderId: null, // Sätts till null initialt
      ownerId: userId,
      lastActivity: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    let driveFolderId = null;
    try {
        // Steg 2: Skapa Google Drive-mappen
        driveFolderId = await createProjectFolder(name, customerName);

        // Steg 3: Uppdatera projektet i Firestore med det nya Drive Folder ID:t
        await updateDoc(projectDocRef, {
            driveFolderId: driveFolderId
        });

    } catch (driveError) {
        console.error("Could not create Google Drive folder. Project created without it.", driveError);
        // Om detta misslyckas, fortsätter vi. Projektet är skapat,
        // men vi har ingen mapp. Detta kan hanteras/försökas igen senare.
    }

    // Bygg det slutgiltiga projektobjektet att returnera
    const newProject: Project = {
        id: projectDocRef.id,
        name,
        customerId,
        customerName,
        status,
        driveFolderId,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error("Error creating project: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}`}), { status: 500 });
  }
}
