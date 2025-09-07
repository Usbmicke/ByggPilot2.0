
import { NextResponse } from 'next/server';
import { createProjectFolder } from '@/app/services/driveService';

/**
 * API-slutpunkt för att skapa en standardiserad projektmapp i Google Drive.
 * Tar emot projectName och customerName i request body.
 */
export async function POST(request: Request) {
  try {
    const { projectName, customerName } = await request.json();

    // Validering
    if (!projectName || !customerName) {
      return NextResponse.json({ error: 'projectName and customerName are required' }, { status: 400 });
    }

    // Anropa Drive-servicen för att skapa mappstrukturen
    const folderId = await createProjectFolder(projectName, customerName);

    // Returnera en lyckad respons med den nya mappens ID
    return NextResponse.json({ 
      message: 'Project folder created successfully in Google Drive', 
      folderId: folderId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating project folder:", error);

    // Skicka ett generiskt felmeddelande till klienten
    return NextResponse.json({ error: 'Failed to create project folder in Google Drive.' }, { status: 500 });
  }
}
