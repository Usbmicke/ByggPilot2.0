
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { handler } from "@/app/api/auth/[...nextauth]/route"; // Felaktig import, bör vara authOptions
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { Timestamp } from 'firebase-admin/firestore';
import { Project } from "@/app/types/project";
import { createInitialProjectStructure } from "@/app/services/driveService";
import { updateProjectInFirestore } from "@/app/services/firestoreService";

// HJÄLPFUNKTION för att städa upp
async function cleanupIncompleteProject(projectId: string) {
    try {
        console.log(`[CLEANUP] Deleting incomplete project with ID: ${projectId}`);
        const projectRef = firestoreAdmin.collection('projects').doc(projectId);
        await projectRef.delete();
        console.log(`[CLEANUP] Successfully deleted project ${projectId}.`);
    } catch (cleanupError) {
        console.error(`[CLEANUP FAILED] Critical error. Could not delete incomplete project ${projectId}. Manual cleanup required.`, cleanupError);
        // Här skulle man kunna lägga till en notifikation till en admin-kanal
    }
}

export async function POST(request: Request) {
  const session = await getServerSession(handler); // Använder felaktigt 'handler', ska vara 'authOptions'
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  const { projectName, clientName, hourlyRate, status } = await request.json();

  if (!projectName || !clientName || !hourlyRate || !status) {
    return new NextResponse(JSON.stringify({ message: 'Nödvändig information saknas.' }), { status: 400 });
  }

  const userId = session.user.id;
  let projectId: string | null = null; // Definiera projectId utanför try-blocket

  try {
    // Steg 1: Skapa projektet i Firestore för att få ett ID
    const newProjectRef = firestoreAdmin.collection('projects').doc();
    projectId = newProjectRef.id; // Sätt projectId här

    const newProjectData = {
      userId,
      projectNumber: 0, 
      projectName,
      clientName,
      hourlyRate,
      status,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      driveFolderId: null, // Börja som null
    };
    await newProjectRef.set(newProjectData);

    // Steg 2: Hämta refresh token
    const userDoc = await firestoreAdmin.collection('users').doc(userId).get();
    const refreshToken = userDoc.data()?.refreshToken;
    if (!refreshToken) {
        throw new Error('Användarens Google-autentisering saknas.');
    }

    // Steg 3: Skapa mappstruktur i Google Drive
    console.log(`Creating Drive structure for new project ${projectId}...`);
    const driveFolderId = await createInitialProjectStructure(refreshToken, projectName);
    console.log(`Successfully created Drive folder with ID: ${driveFolderId}`);

    // Steg 4: Uppdatera projektet med det nya driveFolderId
    await updateProjectInFirestore(projectId, { driveFolderId, updatedAt: Timestamp.now() });

    return NextResponse.json({ id: projectId, ...newProjectData, driveFolderId }, { status: 201 });

  } catch (error) {
    console.error('Error creating project or Drive structure:', error);

    // **SÄKERHETSÅTGÄRD: Om ett fel inträffar, städa upp det ofullständiga projektet**
    if (projectId) {
        await cleanupIncompleteProject(projectId);
    }

    // Skicka ett mer informativt felmeddelande till klienten
    const errorMessage = error instanceof Error ? error.message : 'Ett okänt fel inträffade.';
    return new NextResponse(JSON.stringify({ message: `Internt serverfel: ${errorMessage}` }), { status: 500 });
  }
}
