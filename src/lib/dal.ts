'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions, type EnrichedSession } from '@/lib/config/authOptions';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { logger } from '@/lib/logger';
import { Project } from '@/lib/types';

// =================================================================================
// DATA ACCESS LAYER (DAL) V2.0 - Blueprint "Sektion 1.3"
// =================================================================================
// Denna fil är den enda i hela applikationen som tillåts kommunicera direkt med Firestore.
// Varje funktion måste anropa `getValidatedSession` för att säkerställa att anroparen är autentiserad och auktoriserad.

/**
 * Hämtar och validerar den aktuella sessionen.
 * Kastar ett fel om sessionen är ogiltig eller saknar nödvändiga ID:n.
 * @returns Den berikade och validerade sessionen.
 */
async function getValidatedSession(): Promise<EnrichedSession> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.companyId) {
        logger.error('[DAL] Session validation failed', { session });
        throw new Error('Authentication required: Invalid session or missing user/company ID.');
    }
    return session as EnrichedSession;
}

// --- Namespaces för DAL-funktioner ---

export const dal = {
    /**
     * Funktioner relaterade till projekt.
     */
    projects: {
        /**
         * Hämtar alla aktiva projekt för den inloggade användarens företag.
         * @returns En lista med projekt.
         */
        async getActive(): Promise<Project[]> {
            const session = await getValidatedSession();
            const { companyId } = session.user;

            try {
                const projectsCollection = firestoreAdmin
                    .collection('projects')
                    .where('companyId', '==', companyId)
                    // TODO: Status-logik ska förfinas enligt blueprint, detta är en startpunkt
                    .where('status', '!=', 'COMPLETED');

                const snapshot = await projectsCollection.get();
                if (snapshot.empty) {
                    return [];
                }

                const projects: Project[] = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Förenklad mappning för nu
                    return {
                        id: doc.id,
                        projectName: data.projectName || 'Namnlöst Projekt',
                        clientName: data.clientName || 'Okänd Kund',
                        status: data.status || 'NOT_STARTED',
                        lastActivity: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
                        statusColor: data.status === 'ACTIVE' ? 'green' : 'yellow',
                        progress: data.progress || 0,
                        ...data
                    } as Project;
                });

                logger.info(`[DAL] Fetched ${projects.length} active projects for company ${companyId}`);
                return projects;

            } catch (error) {
                logger.error('[DAL] Error in projects.getActive', { companyId, error });
                throw new Error('Could not fetch active projects.'); // Kastar fel så att anroparen kan hantera det
            }
        },

        /**
         * Skapar ett nytt projekt för den inloggade användarens företag.
         * @param projectData - Datat för det nya projektet.
         * @returns Det skapade projektets ID.
         */
        async create(projectData: { projectName: string; clientName: string; }): Promise<string> {
            const session = await getValidatedSession();
            const { userId, companyId } = session.user;
            
            try {
                const newProjectRef = firestoreAdmin.collection('projects').doc();
                const newProject = {
                    id: newProjectRef.id,
                    ...projectData,
                    companyId,
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'NOT_STARTED',
                    progress: 0
                };

                await newProjectRef.set(newProject);
                logger.info(`[DAL] Created new project "${projectData.projectName}" for company ${companyId}`, { projectId: newProjectRef.id });
                return newProjectRef.id;

            } catch (error) {
                logger.error('[DAL] Error in projects.create', { companyId, userId, error });
                throw new Error('Could not create project.');
            }
        }
    },

    /**
     * Funktioner relaterade till användare.
     */
    users: {
        // Framtida funktioner som getUserProfile etc. kommer här
    }

    // Fler namespaces för customers, quotes, etc. kan läggas till här
};
