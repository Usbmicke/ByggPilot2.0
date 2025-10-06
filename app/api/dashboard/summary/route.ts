
// Fil: app/api/dashboard/summary/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
// KORRIGERAD IMPORT: Pekar nu mot den enda sanningskällan för authOptions.
import { authOptions } from "@/lib/auth";
import { firestoreAdmin } from "@/lib/firebase-admin";
import { Project, ProjectStatus } from "@/types";

// TimeEntry och MaterialCost är inte definierade i app/types, så relaterad logik pausas temporärt.
// import { TimeEntry } from '@/app/types/time'; 
// import { MaterialCost } from '@/app/types/material';

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
    const projectsRef = firestoreAdmin.collection('projects').where('userId', '==', userId);
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
    const ongoingProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
    
    // Logiken för fakturerat värde är pausad eftersom den var baserad på felaktiga antaganden.
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
