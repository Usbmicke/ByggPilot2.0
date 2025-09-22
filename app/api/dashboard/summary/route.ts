
// Fil: app/api/dashboard/summary/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Korrekt import av authOptions
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { Project } from "@/app/types/project";
import { TimeEntry } from '@/app/types/time';
import { MaterialCost } from '@/app/types/material';

// Hjälpfunktion för att summera värden från subkollektioner
async function getProjectSubCollectionSum(projectId: string, collectionName: string, sumField: string): Promise<number> {
    const snapshot = await firestoreAdmin.collection(`projects/${projectId}/${collectionName}`).get();
    if (snapshot.empty) {
        return 0;
    }
    return snapshot.docs.reduce((sum, doc) => sum + (doc.data()[sumField] || 0), 0);
}


export async function GET(request: Request) {
  // Använd de exporterade authOptions för att hämta sessionen
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  try {
    const userId = session.user.id;
    const projectsRef = firestoreAdmin.collection('projects').where('userId', '==', userId);
    const projectsSnapshot = await projectsRef.get();
    
    if (projectsSnapshot.empty) {
        // Om användaren inte har några projekt, returnera nollvärden direkt.
        return NextResponse.json({
            totalProjects: 0,
            ongoingProjects: 0,
            invoicedValue: 0
        }, { status: 200 });
    }

    const projects: Project[] = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    const totalProjects = projects.length;
    const ongoingProjects = projects.filter(p => p.status === 'Pågående').length;
    
    let totalInvoicedValue = 0;
    const invoicedProjects = projects.filter(p => p.status === 'Fakturerat');

    for (const project of invoicedProjects) {
        const totalHours = await getProjectSubCollectionSum(project.id, 'time-entries', 'hours');
        const totalLaborCost = totalHours * (project.hourlyRate || 0);
        const totalMaterialCost = await getProjectSubCollectionSum(project.id, 'material-costs', 'amount');
        totalInvoicedValue += totalLaborCost + totalMaterialCost;
    }

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
