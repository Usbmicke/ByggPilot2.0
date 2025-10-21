
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/lib/db'; // Använder standardiserad DB-anslutning
import { createInitialFolderStructure } from '@/services/driveService'; // <-- KORRIGERAD SÖKVÄG
import { logger } from '@/lib/logger';

// =================================================================================
// API ROUTE: create-drive-structure V2.1 - PLATINUM STANDARD (KORREKT SÖKVÄG)
//
// REVIDERING: Återställt sökvägen till `driveService` till den korrekta platsen
// `@/services/driveService`. Detta löser `Module not found`-felet och den
// efterföljande 500-kraschen.
// =================================================================================

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.accessToken) {
        logger.warn('[API_ONBOARDING] Försök att skapa mappstruktur utan session/token.');
        return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    const { id: userId } = session.user;
    const { accessToken } = session;
    const { companyName } = await req.json();

    if (!companyName || typeof companyName !== 'string') {
        logger.warn(`[API_ONBOARDING] Försök att skapa mappstruktur utan companyName för user: ${userId}`);
        return NextResponse.json({ success: false, error: 'CompanyName is required.' }, { status: 400 });
    }

    logger.info(`[API_ONBOARDING] Startar skapande av mappstruktur för ${userId} med företagsnamn: ${companyName}`);

    try {
        // Anropar nu den korrekt importerade drive-tjänsten
        const { rootFolderId, rootFolderUrl, subFolderIds } = await createInitialFolderStructure(accessToken, companyName);

        const userDocRef = db.collection('users').doc(userId);

        await userDocRef.update({
            onboardingComplete: true,
            companyName: companyName, 
            googleDrive: {
                rootFolderId: rootFolderId,
                rootFolderUrl: rootFolderUrl,
                folderIds: subFolderIds,
            },
            updatedAt: new Date()
        });

        logger.info(`[API_ONBOARDING] SUCCESS: Mappstruktur skapad och användare ${userId} markerad som onboardad.`);

        // Returnerar den faktiska URL:en för mappen för en bättre användarupplevelse
        return NextResponse.json({ success: true, folderUrl: rootFolderUrl });

    } catch (error) {
        logger.error({ 
            message: `[API_ONBOARDING] FATAL: Misslyckades med att skapa mappstruktur för ${userId}`,
            error 
        });
        
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ success: false, error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}
