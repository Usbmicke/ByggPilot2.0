import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { verifyIdToken } from '../auth/firebaseAdmin'; // Importerar från den centraliserade admin-filen

// Initialisera Firebase Admin (görs bäst i en central fil, t.ex. `firebaseAdmin.ts`)

export const listProjects = defineFlow(
  {
    name: 'listProjects',
    inputSchema: z.void(), // Inget input behövs, UID tas från token
    outputSchema: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      // Lägg till andra fält som behövs
    })),
    auth: {
        // Denna policy körs före flödet och verifierar användarens token.
        // Kontexten (context) som returneras här blir tillgänglig för flödet.
        policy: async (auth, input) => {
            const user = await verifyIdToken(auth.idToken!);
            return {
                uid: user.uid
            };
        },
    },
  },
  async (input, context) => {
    // UID är nu tillgängligt via context.auth.uid
    const uid = context.auth.uid;
    
    const firestore = admin.firestore();
    const projectsRef = firestore.collection('users').doc(uid).collection('projects');
    const snapshot = await projectsRef.get();

    if (snapshot.empty) {
      return [];
    }

    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Säkerställ att datan matchar outputSchemat (kan kräva transformering)
    return projects.map(p => ({
      id: p.id,
      name: p.name || 'Namnlöst Projekt',
      description: p.description || '',
    }));
  }
);
