
import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { Project } from '@/app/types';
import { getServerSession } from '@/app/lib/auth';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession();
    const projectId = params.projectId;

    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    if (!projectId) {
      return new NextResponse(JSON.stringify({ message: 'Project ID is missing' }), { status: 400 });
    }

    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);

    // KORRIGERING: Ändrat från ownerId till det korrekta fältet 'userId'
    if (!docSnap.exists() || docSnap.data().userId !== session.user.id) {
        return new NextResponse(JSON.stringify({ message: 'Project not found or access denied' }), { status: 404 });
    }

    const data = docSnap.data();
    
    // Bygger hela projektobjektet
    const project: Project = {
      id: docSnap.id,
      name: data.name,
      customerId: data.customerId,
      customerName: data.customerName,
      status: data.status,
      userId: data.userId, // KORRIGERING: Ändrat från ownerId till userId
      driveFolderId: data.driveFolderId ?? null,
      address: data.address ?? null,
      lat: data.lat ?? undefined,
      lon: data.lon ?? undefined,
      progress: data.progress ?? 0,
      lastActivity: data.lastActivity?.toDate().toISOString() ?? new Date().toISOString(),
      createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
    };

    return NextResponse.json(project);

  } catch (error) {
    console.error(`Error fetching project ${params.projectId}: `, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
