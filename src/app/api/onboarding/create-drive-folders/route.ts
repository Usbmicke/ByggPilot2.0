
// GULDSTANDARD v15.0: SECURE API PROXY ROUTE
import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSession } from '@/app/_lib/session';
import { dal } from '@/app/_lib/dal/dal';

// ===================================================================
// ENDPOINT: /api/onboarding/create-drive-folders
// ===================================================================
//
// Denna API-route agerar som en säker proxy. Den validerar användarens
// session, hämtar nödvändig information från databasen (via DAL),
// och anropar sedan den separata Genkit-servern för att utföra den
// tunga uppgiften att skapa en mappstruktur i Google Drive.
//
// ARKITEKTURPRINCIP: Next.js hanterar frontend och agerar som proxy.
// Genkit hanterar all AI- och tung bakgrundslogik.
//
// ===================================================================

export async function POST(req: NextRequest) {
  console.log('[API /onboarding/create-drive-folders] Mottog begäran.');

  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: 'Ogiltig session' }, { status: 401 });
  }
  console.log(`[API] Session verifierad för userId: ${session.uid}`);

  try {
    // 1. Hämta företagsinformation från vår databas via DAL
    const company = await dal.getCompanyByAdminId(session.uid);
    if (!company) {
      return NextResponse.json({ error: 'Företag hittades inte' }, { status: 404 });
    }

    const { id: companyId, name: companyName } = company;
    console.log(`[API] Företagsdata hämtad för: ${companyName}`);

    // 2. Anropa Genkit-servern för att starta mappskapandet
    // URL:en pekar till den lokala Genkit-servern under utveckling.
    // I produktion måste detta vara den deployade Genkit-serverns URL.
    const genkitServerUrl = process.env.GENKIT_SERVER_URL || 'http://127.0.0.1:3400';
    
    console.log(`[API] Anropar Genkit-server på: ${genkitServerUrl}`);

    const response = await fetch(`${genkitServerUrl}/createOnboardingFolderStructure`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId, companyName }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[API] Fel från Genkit-server: ${response.status}`, errorBody);
      throw new Error(`Genkit-servern svarade med status: ${response.status}`);
    }

    const result = await response.json();

    // 3. (Valfritt) Spara resultatet (t.ex. Drive-mappens ID) i vår databas
    await dal.updateCompany(companyId, {
      driveRootFolderId: result.output.driveRootFolderId,
      driveRootFolderUrl: result.output.driveRootFolderUrl,
    });
    console.log(`[API] Drive-information sparad för companyId: ${companyId}`);

    return NextResponse.json({ success: true, ...result.output });

  } catch (error) {
    console.error('[API] Ett oväntat fel inträffade:', error);
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 });
  }
}
