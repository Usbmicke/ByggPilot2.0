
import { NextResponse } from 'next/server';
import { doc, updateDoc, getDocs, collection, query, limit } from 'firebase/firestore';
import { db } from '@/services/firestoreService';

/**
 * TEMPORARY API ROUTE
 * 
 * This route is for one-time use to add coordinates to the first existing project.
 * It finds the most recent project and updates it with coordinates for Stockholm.
 * 
 * THIS SHOULD BE DELETED AFTER USE.
 */
export async function GET(request: Request) {
  try {
    // 1. Find the first project in the database
    const q = query(collection(db, "projects"), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ message: "No projects found in the database. Nothing to update." }, { status: 404 });
    }

    // 2. Get the ID of the first project
    const projectDoc = querySnapshot.docs[0];
    const projectId = projectDoc.id;
    const projectName = projectDoc.data().name;

    // 3. Define the coordinates to add (Stockholm)
    const stockholmCoords = {
      lat: 59.3293,
      lon: 18.0686,
      address: "Stockholm, Sweden" // Add address as well for completeness
    };

    // 4. Update the document in Firestore
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, stockholmCoords);

    return NextResponse.json({
      message: `Successfully added coordinates to project: '${projectName}' (ID: ${projectId}). You should now delete this API route. `,
      updatedData: stockholmCoords
    });

  } catch (error) {
    console.error("Error in temporary coordinate update: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
