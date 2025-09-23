
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { Timestamp } from 'firebase-admin/firestore';
import { Project } from "@/app/types/project";
import { createInitialProjectStructure } from "@/app/services/driveService"; // Importera funktionen
import { updateProjectInFirestore } from "@/app/services/firestoreService"; // Hjälpfunktion för uppdatering

export async function POST(request: Request) {
  const session = await getServerSession(handler);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  const { projectName, clientName, hourlyRate, status } = await request.json();

  if (!projectName || !clientName || !hourlyRate || !status) {
    return new NextResponse(JSON.stringify({ message: 'Nödvändig information saknas.' }), { status: 400 });
  }

  try {
    const userId = session.user.id;

    // 1. Hämta användarens refresh token från Firestore
    const userDoc = await firestoreAdmin.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const refreshToken = userData?.refreshToken; 

    if (!refreshToken) {
        return new NextResponse(JSON.stringify({ message: 'Användarens Google-autentisering saknas eller har gått ut.' }), { status: 403 });
    }

    // 2. Skapa projektet i Firestore (som tidigare)
    const newProjectRef = firestoreAdmin.collection('projects').doc();
    const newProjectData: Omit<Project, 'id' | 'driveFolderId'> & { createdAt: Timestamp, updatedAt: Timestamp } = {
      userId,
      projectNumber: 0, // Temporärt, kommer att ersättas av transaktion
      projectName,
      clientName,
      hourlyRate,
      status,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await newProjectRef.set(newProjectData);
    const projectId = newProjectRef.id;

    // 3. Skapa mappstruktur i Google Drive
    console.log(`Creating Drive structure for new project ${projectId}...`);
    const driveFolderId = await createInitialProjectStructure(refreshToken);
    console.log(`Successfully created Drive folder with ID: ${driveFolderId}`);

    // 4. Uppdatera projektet med det nya driveFolderId
    await updateProjectInFirestore(projectId, { driveFolderId });

    // (Behåll transaktionen för projektnummer om den fortfarande är relevant)
    // ...

    return NextResponse.json({ id: projectId, ...newProjectData, driveFolderId }, { status: 201 });

  } catch (error) {
    console.error('Error creating project or Drive structure:', error);
    // Lägg till logik för att eventuellt städa upp om ett steg misslyckas
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid skapande av projekt.' }), { status: 500 });
  }
}
