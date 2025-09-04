
import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { Project } from '@/app/types';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params.projectId;
    if (!projectId) {
      return new NextResponse(JSON.stringify({ message: 'Project ID is missing' }), { status: 400 });
    }

    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new NextResponse(JSON.stringify({ message: 'Project not found' }), { status: 404 });
    }

    const data = docSnap.data();
    const project: Project = {
      id: docSnap.id,
      name: data.name,
      customerName: data.customerName,
      status: data.status,
      lastActivity: data.lastActivity?.toDate().toISOString(),
      createdAt: data.createdAt?.toDate().toISOString(),
      driveFolderId: data.driveFolderId
    };

    return NextResponse.json(project);

  } catch (error) {
    console.error(`Error fetching project ${params.projectId}: `, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
