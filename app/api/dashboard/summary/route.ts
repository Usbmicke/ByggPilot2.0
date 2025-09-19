
// Fil: app/api/dashboard/summary/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import { Project } from "@/app/types/project";
import { TimeEntry } from '@/app/types/time';
import { MaterialCost } from '@/app/types/material';

async function getCollectionSum(collectionName: string, projectId: string): Promise<number> {
    const snapshot = await firestoreAdmin.collection(collectionName).where('projectId', '==', projectId).get();
    if (snapshot.empty) return 0;
    
    // Anpassa för att summera rätt fält
    if (collectionName === 'time-entries') {
        return snapshot.docs.reduce((sum, doc) => sum + (doc.data() as TimeEntry).hours, 0);
    }
    if (collectionName === 'material-costs') {
        return snapshot.docs.reduce((sum, doc) => sum + (doc.data() as MaterialCost).amount, 0);
    }
    return 0;
}


export async function GET(request: Request) {
  const session = await getServerSession(handler);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ message: 'Användaren är inte auktoriserad.' }), { status: 401 });
  }

  try {
    const userId = session.user.id;
    const projectsRef = firestoreAdmin.collection('projects');
    const projectsQuery = projectsRef.where('userId', '==', userId);
    const projectsSnapshot = await projectsQuery.get();
    
    const projects: Project[] = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    const totalProjects = projects.length;
    const ongoingProjects = projects.filter(p => p.status === 'Pågående').length;
    
    let totalInvoicedValue = 0;
    const invoicedProjects = projects.filter(p => p.status === 'Fakturerat');

    for (const project of invoicedProjects) {
        const totalHours = await getCollectionSum('time-entries', project.id);
        const totalLaborCost = totalHours * project.hourlyRate;
        const totalMaterialCost = await getCollectionSum('material-costs', project.id);
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
