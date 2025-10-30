
// Fil: app/api/dashboard/summary/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/config/authOptions";
import { firestoreAdmin } from "@/lib/config/firebase-admin";
import { Project, ProjectStatus } from "@/app/types";

async function getProjectSubCollectionSum(projectId: string, collectionName: string, sumField: string): Promise<number> {
    const snapshot = await firestoreAdmin.collection(`projects/${projectId}/${collectionName}`).get();
    if (snapshot.empty) {
        return 0;
    }
    return snapshot.docs.reduce((sum, doc) => sum + (doc.data()[sumField] || 0), 0);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  try {
    const userId = session.user.id;
    const projectsRef = firestoreAdmin.collectionGroup('projects').where('userId', '==', userId);
    const projectsSnapshot = await projectsRef.get();
    
    if (projectsSnapshot.empty) {
        return NextResponse.json({
            totalProjects: 0,
            ongoingProjects: 0,
            invoicedValue: 0
        }, { status: 200 });
    }

    const projects: Project[] = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    const totalProjects = projects.length;
    
    // VÄRLDSKLASS-KORRIGERING: Korrigerat stavfel från 'InProgress' till 'In Progress'
    const statusFilter: ProjectStatus = 'In Progress';
    const ongoingProjects = projects.filter(p => p.status === statusFilter).length;
    
    const totalInvoicedValue = 0;

    return NextResponse.json({
      totalProjects,
      ongoingProjects,
      invoicedValue: totalInvoicedValue
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return new NextResponse(JSON.stringify({ message: 'Internt serverfel vid hämtning av summeringsdata.' }), { status: 500 });
  }
}
