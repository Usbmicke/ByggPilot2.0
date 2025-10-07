
// Fil: app/api/dashboard/summary/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { firestoreAdmin } from "@/lib/firebase-admin";
// IMPORTER REPARERADE: Hämtar nu från den centrala typdefinitionen.
import { Project, ProjectStatus } from "@/types";

// TimeEntry och MaterialCost är inte definierade i app/types, så relaterad logik pausas temporärt.
// import { TimeEntry } from '@/app/types/time'; 
// import { MaterialCost } from '@/app/types/material';

// Denna funktion är korrekt och kan återanvändas senare.
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
    // REPARERAD LOGIK: Använder nu ProjectStatus-enum istället för en hårdkodad sträng.
    const ongoingProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
    
    // TILLFÄLLIGT PAUSAD: Logiken nedan är baserad på en felaktig projekt-status ("Fakturerat")
    // och icke-existerande datatyper. Den måste skrivas om för att matcha den korrekta datamodellen.
    // Istället för att krascha, returnerar vi 0 som ett temporärt värde.
    const totalInvoicedValue = 0;

    /*
    const invoicedProjects = projects.filter(p => p.status === 'Fakturerat'); // FELAKTIG STATUS

    for (const project of invoicedProjects) {
        // Denna kod förutsätter också fält (t.ex. hourlyRate) som inte finns på Project-typen.
        const totalHours = await getProjectSubCollectionSum(project.id, 'time-entries', 'hours');
        const totalLaborCost = totalHours * (project.hourlyRate || 0); 
        const totalMaterialCost = await getProjectSubCollectionSum(project.id, 'material-costs', 'amount');
        totalInvoicedValue += totalLaborCost + totalMaterialCost;
    }
    */

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
