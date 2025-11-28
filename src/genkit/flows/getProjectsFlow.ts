
import 'server-only';
import { defineFlow, run } from '@genkit-ai/flow';
import { firebaseAuth, AuthContext } from '@genkit-ai/firebase/auth';
import { z } from 'zod';
import { projectRepo, Project } from '../dal/project.repo';
import { auth } from '../firebase';

// ===================================================================
// Zod Schema for Project Output
// ===================================================================
// Definierar formen på data som skickas tillbaka till klienten.
// Detta säkerställer typ-säkerhet mellan server och klient.
// ===================================================================

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  description: z.string().optional(),
  // Konvertera Date-objekt till ISO 8601-strängar för JSON-serialisering
  createdAt: z.string().transform((str) => new Date(str).toISOString()),
});

// ===================================================================
// Security Policy (Auth Policy)
// ===================================================================

const authPolicy = async (context: AuthContext, input: any) => {
  if (!context.auth) {
    throw new Error('Authentication required.');
  }
};

// ===================================================================
// Get Projects Flow
// ===================================================================
// Hämtar en lista av projekt (mappar) som ägs av den autentiserade
// användaren. Detta är en läs-operation (query).
// ===================================================================

export const getProjectsFlow = defineFlow(
  {
    name: 'getProjectsFlow',
    inputSchema: z.void(),
    outputSchema: z.array(ProjectSchema),
    middleware: [firebaseAuth(auth, authPolicy)],
  },
  async (_, context) => {
    const userId = context.auth!.uid;
    console.log(`[Get Projects] Fetching projects for user: ${userId}`);

    const projects = await run('fetch-user-projects', () =>
      projectRepo.findAllByOwner(userId)
    );

    // Mappa databas-objekten (Project[]) till DTOs (Data Transfer Objects)
    // som matchar Zod-schemat. Detta säkerställer att endast den data
    // klienten behöver skickas och att formatet är korrekt.
    const projectsDto = projects.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    }));

    console.log(`[Get Projects] Found ${projects.length} projects.`);
    return projectsDto;
  }
);
