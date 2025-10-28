
// Fil: app/api/dashboard/summary/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { firestoreAdmin } from "@/app/lib/firebase-admin";
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
    // VÄRLDSKLASS-FIX: Använder admin-SDK, query mot toppnivå-collectionen, filtrera på userId.
    const projectsRef = firestoreAdmin.collectionGroup('projects').where('userId', '==', userId);
    const projectsSnapshot = await projectsRef.get();
    
    if (projectsSnapshot.empty) {
        return NextResponse.json({
            totalProjects: 0,
            ongoingProjects: 0,
            invoicedValue: 0
        }, { status: 200 });
    }

    // Säkerställer att datan matchar Project-typen.
    const projects: Project[] = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    const totalProjects = projects.length;
    // VÄRLDSKLASS-KORRIGERING: Använder sträng-literal då ProjectStatus är en 'type', inte en 'enum'.
    const ongoingProjects = projects.filter(p => p.status === 'InProgress').length;
    
    // Pausad logik för fakturering kvarstår, returnerar 0.
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
