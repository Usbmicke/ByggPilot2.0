
import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { createProjectFolder } from '@/app/services/driveService';
import { getSession } from '@/app/lib/session';
// **STEG 1: Importera de uppdaterade typerna för tydlighet**
import { Project, ProjectStatus } from '@/app/types';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    // Status-värdet är nu garanterat ett av värdena i ProjectStatus enum
    const { name, customerId, customerName, status } = await request.json();

    if (!name || !customerId || !customerName || !status) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    // Spara projektet i Firestore med initiala värden för alla fält
    const projectDocRef = await addDoc(collection(db, "projects"), {
      name,
      customerId,
      customerName,
      status,
      ownerId: userId,
      driveFolderId: null,
      address: null,
      lat: null,
      lon: null,
      progress: 0, // Starta alltid på 0%
      lastActivity: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    let driveFolderId: string | null = null;
    try {
        driveFolderId = await createProjectFolder(name, customerName);
        await updateDoc(projectDocRef, { driveFolderId: driveFolderId });
    } catch (driveError) {
        console.error("Could not create Google Drive folder. Project created without it.", driveError);
    }

    // **STEG 2: Bygg ett komplett och korrekt projektobjekt att returnera**
    // Detta objekt måste matcha Project-interfacet i types.ts exakt.
    const newProject: Project = {
        id: projectDocRef.id,
        name,
        customerId,
        customerName,
        status,
        driveFolderId,
        address: null,
        lat: undefined, // undefined är lämpligare än null för number-typer i JS
        lon: undefined,
        progress: 0,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error("Error creating project: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}`}), { status: 500 });
  }
}
