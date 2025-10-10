
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { listProjectsForUser } from '@/services/projectService';
// Importerar liknande funktion för kunder, antaget att den finns
// import { listCustomersForUser } from '@/services/customerService'; 

// =================================================================================
// GULDSTANDARD: ORCHESTRATOR v1.1 - KORRIGERING AV API-NYCKEL
// Korrigerar anropet för att använda GEMINI_API_KEY.
// =================================================================================

// KORRIGERING: Explicit API-nyckelhantering
if (!process.env.GEMINI_API_KEY) {
  throw new Error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
}
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const model = google('gemini-1.5-flash-latest');

// Systemprompt specifikt för avsiktsanalys.
const orchestratorSystemPrompt = `
  Du är en textanalys-motor. Ditt enda uppdrag är att analysera texten och identifiera om användaren frågar om 
  'projekt', 'kunder', 'dokument', 'ekonomi', eller om det är en 'allmän' fråga.
  Svara ENDAST med ett JSON-objekt med en enda nyckel, "intent".
  Exempel: Användare skriver "visa alla mina projekt". Du svarar {"intent":"projekt"}.
  Exempel: Användare skriver "vem är micke". Du svarar {"intent":"allmän"}.
`;

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Autentisering krävs.' }, { status: 401 });
    }
    const userId = session.user.id;

    const { message }: { message: string } = await req.json();

    if (!message) {
      return NextResponse.json({ context: '' }); // Returnera tom kontext om inget meddelande finns
    }

    // 1. Analysera avsikt
    const { text } = await generateText({
      model,
      system: orchestratorSystemPrompt,
      prompt: `Analysera denna användarfråga: "${message}"`,
    });

    let intent = 'allmän';
    try {
      intent = JSON.parse(text).intent;
    } catch {
      // Om AI:n inte svarar med giltig JSON, fall tillbaka till 'allmän'
    }

    let context = '';
    let source = 'none';

    // 2. Hämta data baserat på avsikt
    if (intent === 'projekt') {
      const projects = await listProjectsForUser(userId);
      if (projects.length > 0) {
        const projectNames = projects.map(p => p.name).join(', ');
        context = `Användaren har tillgång till följande projekt: ${projectNames}. Basera ditt svar på denna information.`;
        source = 'projects';
      } else {
        context = "Användaren har inga projekt för närvarande.";
        source = 'projects';
      }
    } 
    // Här kan 'else if' för 'kunder', 'dokument' etc. byggas ut i framtiden.
    // else if (intent === 'kund') { ... }

    // 3. Returnera den berikade kontexten
    return NextResponse.json({ context, source });

  } catch (error) {
    console.error('[Orchestrator Error]', error);
    // Returnera en tom kontext vid fel för att inte krascha chatt-flödet
    return NextResponse.json({ context: '', source: 'error' });
  }
};
