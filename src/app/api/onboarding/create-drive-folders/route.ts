
import { NextResponse, type NextRequest } from 'next/server';
import { verifySession, getMyProfile, completeMyOnboarding } from '@/app/_lib/dal/dal';

// GULDSTANDARD v5.0: Importera Genkit-flödet och 'run' direkt.
// Webpack-konfigurationen i next.config.mjs säkerställer att detta fungerar
// smidigt inom en enda `npm run dev`-process.
import { run } from '@genkit-ai/flow';
import { createOnboardingFolderStructureFlow } from '@/app/_lib/genkit/flows/onboarding';
import { initGenkit } from '@/app/_lib/genkit';

// Kör Genkit-initieringen en gång när servern startar.
initGenkit();

export async function POST(request: NextRequest) {
  console.log("[API /create-drive-folders] Mottog POST-anrop (v3 - Enkel Process)");

  try {
    // 1. Verifiera sessionen
    const session = await verifySession(request.cookies.get('__session')?.value);
    console.log(`[API] Session verifierad för userId: ${session.userId}`);

    // 2. Hämta användarprofil för att få företagsnamn
    const userProfile = await getMyProfile(session);
    if (!userProfile || !userProfile.companyName) {
      throw new Error("Kunde inte hitta användarprofil eller företagsnamn.");
    }

    console.log(`[API] Anropar Genkit-flöde direkt för företag: ${userProfile.companyName}`);

    // 3. Kör Genkit-flödet direkt i samma process
    const flowResult = await run(createOnboardingFolderStructureFlow, {
        companyId: session.companyId,
        companyName: userProfile.companyName,
    });

    const driveRootFolderId = flowResult.driveRootFolderId;
    const driveRootFolderUrl = flowResult.driveRootFolderUrl;

    if (!driveRootFolderId) {
      throw new Error("Inget driveRootFolderId mottogs från Genkit-flödet.");
    }

    console.log(`[API] Genkit-flöde slutfört. Mapp-ID: ${driveRootFolderId}`);

    // 4. Spara resultatet i databasen via DAL
    await completeMyOnboarding(session, driveRootFolderId);

    console.log(`[API] Onboarding markerad som slutförd för userId: ${session.userId}`);

    // 5. Returnera framgångsrikt svar
    return NextResponse.json({
      success: true,
      message: 'Mappstruktur skapad och onboarding slutförd!',
      driveFolderUrl: driveRootFolderUrl
    }, { status: 200 });

  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      console.error("[API] Obehörig åtkomst:", error.message);
      return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
    }

    console.error(`[API] Internt serverfel i /create-drive-folders: ${error.message}`, error);
    return NextResponse.json({ error: 'Kunde inte skapa mappstruktur.', details: error.message }, { status: 500 });
  }
}
