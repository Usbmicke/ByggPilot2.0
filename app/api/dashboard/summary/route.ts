
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { firestoreAdmin } from "@/lib/firebase-admin";
import { Project, ProjectStatus } from "@/types";

// TimeEntry och MaterialCost är inte definierade i app/types, så relaterad logik pausas temporärt.

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const projectsRef = firestoreAdmin.collection('projects');
    const userProjectsQuery = projectsRef.where('userId', '==', userId);

    const activeProjectsQuery = userProjectsQuery.where('status', '==', ProjectStatus.Active);
    const completedProjectsQuery = userProjectsQuery.where('status', '==', ProjectStatus.Completed);

    const [
      activeProjectsSnapshot,
      completedProjectsSnapshot,
      // Temporärt borttagna anrop tills typerna är definierade
      // timeEntriesSnapshot,
      // materialCostsSnapshot,
    ] = await Promise.all([
      activeProjectsQuery.get(),
      completedProjectsQuery.get(),
      // firestoreAdmin.collectionGroup('timeEntries').where('userId', '==', userId).get(),
      // firestoreAdmin.collectionGroup('materialCosts').where('userId', '==', userId).get(),
    ]);

    const totalActiveProjects = activeProjectsSnapshot.size;
    const totalCompletedProjects = completedProjectsSnapshot.size;

    // Pausad logik
    // const totalHours = timeEntriesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().hours || 0), 0);
    // const totalCost = materialCostsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().cost || 0), 0);

    return NextResponse.json({
      totalActiveProjects,
      totalCompletedProjects,
      totalHours: 0, // Temporärt hårdkodat
      totalCost: 0,  // Temporärt hårdkodat
    });

  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
