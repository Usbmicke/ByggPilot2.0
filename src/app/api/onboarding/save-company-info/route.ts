
import { NextResponse, type NextRequest } from 'next/server';
import { verifySession, saveMyCompanyInfo } from '@/app/_lib/dal/dal'; // Importera relevanta DAL-funktioner
import { z } from 'zod';

// Zod-schema för att validera inkommande data från klienten
const CompanyInfoSchema = z.object({
  companyName: z.string().min(1, "Företagsnamn får inte vara tomt."),
  companyAddress: z.string().min(1, "Adress får inte vara tomt."),
  // NYTT: Logotypens URL är valfri men måste vara en giltig URL om den finns
  companyLogoUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  console.log("[API /onboarding/save-company-info] Mottog begäran.");

  try {
    // 1. Verifiera sessionen från cookien. Detta är vår säkerhetskontroll.
    const session = await verifySession(request.cookies.get('__session')?.value);
    console.log(`[API] Session verifierad för userId: ${session.userId}`);

    // 2. Validera request body
    const body = await request.json();
    const validation = CompanyInfoSchema.safeParse(body);

    if (!validation.success) {
      console.error("[API] Valideringsfel:", validation.error);
      return NextResponse.json({ error: 'Ogiltig indata.', details: validation.error.flatten() }, { status: 400 });
    }

    const { companyName, companyAddress, companyLogoUrl } = validation.data;

    // 3. Anropa DAL-funktionen för att spara informationen
    // DAL hanterar den faktiska databasinteraktionen.
    await saveMyCompanyInfo(session, companyName, companyAddress, companyLogoUrl);
    console.log(`[API] Företagsinformation sparad för companyId: ${session.companyId}`);

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error: any) {
    // Om verifySession misslyckas kastas ett fel som fångas här.
    if (error.message.includes('Unauthorized')) {
        console.error("[API] Obehörig åtkomst:", error.message);
        return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
    }

    console.error(`[API] Internt serverfel: ${error.message}`, error);
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 });
  }
}
