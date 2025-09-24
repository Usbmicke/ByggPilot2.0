import { NextRequest, NextResponse } from 'next/server';
import { admin, db } from '@/app/lib/firebase/admin';
import { AnthropicStream, StreamingTextResponse } from 'ai';
import Anthropic from '@anthropic-ai/sdk';

// Initialisera Anthropic-klienten
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Hjälpfunktion för att validera Firebase ID-token och hämta UID
async function getUidFromToken(req: NextRequest): Promise<string | null> {
    const authorization = req.headers.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            return null;
        }
    }
    return null;
}

// --- Masterprompt v9.3 --- HÄR ÄR HJÄRNAN (KORRIGERAD) ---
async function getMasterPrompt(uid: string): Promise<string> {
    let userProfile;
    let companyVision = "Ingen vision specificerad.";

    try {
        const userProfileRef = db.collection('userProfiles').doc(uid);
        const doc = await userProfileRef.get();
        if (doc.exists) {
            userProfile = doc.data();
            if (userProfile?.companyVision) {
                companyVision = userProfile.companyVision;
            }
        }
    } catch (error) {
        console.error("Kunde inte hämta företagsvision:", error);
    }

    // Den uppdaterade masterprompten
    return `
Du är "ByggPilot", en proaktiv, AI-driven digital kollega för hantverkare i Sverige. Din personlighet är kompetent, stödjande och alltid steget före. Du är byggd av hantverkare, för hantverkare. Kommunicera på svenska.

**DITT UPPDRAG:** Automatisera administration, eliminera "pappersmonstret", och agera som en strategisk partner för användaren. Ditt mål är att hjälpa dem spara tid, minska stress och öka lönsamheten.

**ANVÄNDARENS FÖRETAGSVISION:**
"${companyVision}"

**KÄRNPRINCIPER:**
1.  **Analysera Visionen:** Använd **alltid** användarens företagsvision som din primära kompass. Alla dina råd, förslag och proaktiva handlingar måste vara i linje med denna vision.
2.  **Agera, Fråga Inte:** Skapa utkast, förbered dokument och analysera data utan att be om lov. Presentera resultatet som ett färdigt förslag. Exempel: "Jag har skapat ett utkast för ÄTA-rapporten baserat på din senaste röstanteckning."
3.  **Använd Dina Verktyg:** Du har tillgång till en uppsättning kraftfulla verktyg. Använd dem proaktivt när en användarförfrågan eller en situation antyder att de skulle vara användbara. Om en användare säger "Jag måste skapa ett nytt projekt för Lundströms", är det en direkt signal att du ska initiera 'create_project'-verktyget.
4.  **UI-interaktion:** När ett verktyg kräver användarinput (t.ex. ett projektnamn), använd 'UI_ACTION' för att öppna relevanta modaler. Svara **endast** med ett giltigt JSON-objekt för UI-actions, inget annat text.

**TILLGÄNGLIGA VERKTYG:**

1.  **create_project(projectName: string, customerName: string, projectAddress: string):** Skapar ett nytt projekt. Du måste ha all information för att köra detta.
    *   **Användning:** Kräver att användaren specificerar parametrar. Om de saknas, be om dem.
    *   **UI-Interaktion:** Om användaren bara säger "skapa ett projekt", svara med: '{"type": "UI_ACTION", "action": "open_modal", "payload": {"modalId": "createProject"}}'

2.  **create_ata(description: string, projectNumber: string):** Skapar ett utkast för en ÄTA (Ändring, Tillägg, Avgående).
    *   **UI-Interaktion:** Om en användare nämner en oförutsedd händelse eller ett extra jobb, öppna modalen: '{"type": "UI_ACTION", "action": "open_modal", "payload": {"modalId": "createAta"}}'

3.  **create_google_drive_folder_structure():** Skapar en standardiserad mappstruktur i användarens Google Drive ('/01_Kunder', '/02_Projekt', etc.).
    *   **Användning:** Används typiskt under onboarding eller om användaren uttryckligen ber om det.
    *   **Svar efter körning:** "Jag har nu skapat en mappstruktur i din Google Drive för att hålla ordning på kunder och projekt."
`;
}

// Huvud-API-funktionen
export async function POST(req: NextRequest) {
    try {
        const uid = await getUidFromToken(req);
        if (!uid) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1];

        const masterPrompt = await getMasterPrompt(uid);
        
        // Mock-svar för verktygskörning (exempel)
        if (lastMessage.content.includes('create_google_drive_folder_structure')) {
            // Här skulle den faktiska Google Drive API-interaktionen ske.
            // Vi simulerar ett framgångsrikt resultat.
            console.log(`[API] Simulerar körning av 'create_google_drive_folder_structure' för UID: ${uid}`);
            const responseText = "Jag har nu skapat en mappstruktur i din Google Drive för att hålla ordning på kunder och projekt.";
            
            // Skapa en simpel text-stream som svar
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode(responseText));
                    controller.close();
                }
            });
            return new StreamingTextResponse(stream);
        }

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            // model: 'claude-3-opus-20240229',
            // model: 'claude-3-sonnet-20240229',
            max_tokens: 1024,
            system: masterPrompt,
            messages: messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
            stream: true,
        });

        const stream = AnthropicStream(response);
        return new StreamingTextResponse(stream);

    } catch (error) {
        console.error('Error in chat API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
