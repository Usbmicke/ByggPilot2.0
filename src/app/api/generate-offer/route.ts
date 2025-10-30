
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createOfferFile } from '@/lib/services/googleDriveService'; // Updated import

const createOfferPrompt = (details: any) => {
    return `
        Du är en expert på att skriva offerter för ett svenskt byggföretag med namnet ByggPilot.
        Ditt mål är att skapa en professionell, välstrukturerad och förtroendeingivande offert i HTML-format.
        Använd en tydlig och vänlig ton. Svara ENDAST med HTML-koden för offerten, inget annat.

        Här är detaljerna för offerten som ska skapas:
        - Kundens namn: ${details.customerName}
        - Projektnamn: ${details.projectName}
        - Arbetsbeskrivning: ${details.workDescription}
        - Prisuppskattning: ${details.priceEstimate} SEK

        Inkludera följande sektioner i HTML-strukturen:
        1.  En tydlig rubrik "Offert från ByggPilot".
        2.  Projekt- och kundinformation.
        3.  Dagens datum.
        4.  En detaljerad beskrivning av arbetet som ska utföras.
        5.  Den uppskattade kostnaden, tydligt specificerad.
        6.  Information om nästa steg (t.ex. "Kontakta oss för att godkänna offerten").
        7.  En avslutande hälsning.

        Använd grundläggande HTML-element som <h1>, <h2>, <p>, <strong>, <hr>.
    `;
};

export async function POST(req: NextRequest) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        console.error("[Generate Offer] GEMINI_API_KEY är inte konfigurerad.");
        return NextResponse.json({ error: "Serverkonfigurationsfel: AI-motorn är inte konfigurerad." }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { offerDetails } = body;
        
        if (!offerDetails || !offerDetails.projectName) {
            return NextResponse.json({ error: 'Offertdetaljer, inklusive projektnamn, saknas' }, { status: 400 });
        }

        // 1. Generate Offer Content with AI
        const prompt = createOfferPrompt(offerDetails);
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const generationResult = await model.generateContent(prompt);
        const offerContent = generationResult.response.text();

        // 2. Save the generated offer to Google Drive using the dedicated service function
        const fileName = `Offert_${offerDetails.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
        
        const serviceResponse = await createOfferFile(offerDetails.projectName, fileName, offerContent);

        if (!serviceResponse.success || !serviceResponse.webViewLink) {
            throw new Error(serviceResponse.error || 'Ett okänt fel inträffade vid filskapandet i Google Drive.');
        }

        return NextResponse.json({ 
            success: true, 
            message: "Offerten har skapats med AI och sparats i Google Drive.",
            fileLink: serviceResponse.webViewLink
        });

    } catch (error: any) {
        console.error("Fel vid skapande av offert:", error);
        // Provide a more user-friendly error message
        const message = error.message.includes('GEMINI') 
            ? "Ett fel inträffade vid generering av offertinnehållet."
            : `Serverfel: ${error.message}`;
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
