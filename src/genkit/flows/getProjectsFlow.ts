import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { projectRepo } from '@/lib/dal/project.repo';
import { FlowAuth } from '@genkit-ai/core/lib/auth';

// Inget input-schema behövs för detta flöde
const GetProjectsInputSchema = z.undefined();

// Definiera output-schemat, en array av projekt
const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});
const GetProjectsOutputSchema = z.array(ProjectSchema);

// Definiera flödet
export const getProjectsFlow = defineFlow(
  {
    name: 'getProjectsFlow',
    inputSchema: GetProjectsInputSchema,
    outputSchema: GetProjectsOutputSchema,
  },
  async (_, { auth }) => { // Vi behöver inte `input` men vi behöver `auth`

    if (!auth?.uid) {
      throw new Error('403 Forbidden: An authenticated user is required.');
    }

    console.log(`Fetching projects for user: ${auth.uid}`);

    try {
      // Här skulle du normalt hämta projekt som är associerade med auth.uid
      // För detta exempel använder vi den simulerade `findAll` metoden
      const projects = await projectRepo.findAll();

      console.log(`Found ${projects.length} projects for user: ${auth.uid}`);

      return projects;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw new Error('Failed to fetch projects.');
    }
  }
);
