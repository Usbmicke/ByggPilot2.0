
import 'server-only';
import { defineFlow, run } from '@genkit-ai/flow';
import { firebaseAuth } from '@genkit-ai/firebase/auth';
import { z } from 'zod';
// import { projectRepo } from '../dal/project.repo'; // INAKTIVERAD TILLS VIDARE

// Placeholder-schema för projekt
const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
});

export const getProjectsFlow = defineFlow(
  {
    name: 'getProjectsFlow',
    inputSchema: z.void(), // Inget input behövs för att hämta alla projekt
    outputSchema: z.array(ProjectSchema),
    middleware: [firebaseAuth()], // Använd middleware för auth-skydd
  },
  async (_, context) => {
    const userId = context.auth!.uid;
    console.log(`Fetching projects for user: ${userId}`);

    // const projects = await run('fetch-user-projects', () => 
    //   projectRepo.findAllByOwner(userId)
    // );

    // return projects;

    // ---- Temporär Placeholder-data ----
    // Denna kod ska tas bort när project.repo.ts har skapats korrekt.
    console.warn('Using placeholder data for getProjectsFlow!');
    return [
      { id: 'proj_1', name: 'Placeholder Project 1', ownerId: userId },
      { id: 'proj_2', name: 'Placeholder Project 2', ownerId: userId },
    ];
    // -------------------------------------
  }
);
