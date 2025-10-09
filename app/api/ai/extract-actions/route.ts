
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface ClassifiedEmail {
    id: string;
    from: string;
    subject: string;
    snippet: string;
    classification: string;
    userId: string; // Viktigt: Vi måste veta vilken användare detta gäller
}

// ... (getActionExtractionPrompt förblir oförändrad)
const getActionExtractionPrompt = (email: ClassifiedEmail): string => {
    const { id, from, subject, snippet, classification } = email;

    // Välj prompt baserat på den tidigare gjorda klassificeringen
    switch (classification) {
        case 'Kundförfrågan':
            return `
                Du är en hyper-effektiv assistent i ett svenskt byggföretag. 
                Din uppgift är att omvandla en ostrukturerad e-postförfrågan till ett strukturerat JSON-objekt för vidare hantering. 
                Svara ENDAST med ett giltigt JSON-objekt och ingen annan text.

                E-post som ska analyseras:
                - Avsändare: ${from}
                - Ämne: ${subject}
                - Innehåll: ${snippet}

                Strukturera din output enligt följande JSON-format:
                {
                  "actionType": "PROJECT_LEAD",
                  "sourceEmailId": "${id}",
                  "summary": "En kort sammanfattning av uppdraget, max 10 ord.",
                  "contact": {
                    "name": "Fullständigt namn på kontakten, om det kan utläsas.",
                    "email": "E-postadressen till kontakten.",
                    "phone": "Telefonnummer, om det finns."
                  },
                  "details": "En mer detaljerad beskrivning av vad kunden vill ha gjort, baserat på innehållet.",
                  "suggestedNextStep": "Föreslå ett konkret, proaktivt nästa steg, t.ex. 'Boka ett platsbesök för att diskutera detaljer' eller 'Ta fram en initial offertbas på informationen'."
                }
            `;

        case 'Leverantörsfaktura':
             return `
                Du är en hyper-effektiv ekonomiassistent i ett svenskt byggföretag.
                Din uppgift är att extrahera nyckelinformation från en leverantörsfaktura och omvandla den till ett strukturerat JSON-objekt för bokföring.
                Svara ENDAST med ett giltigt JSON-objekt och ingen annan text.

                E-post som ska analyseras:
                - Avsändare: ${from}
                - Ämne: ${subject}
                - Innehåll: ${snippet}

                Strukturera din output enligt följande JSON-format:
                {
                  "actionType": "INVOICE_PROCESSING",
                  "sourceEmailId": "${id}",
                  "vendorName": "Leverantörens namn (t.ex. 'Beijer Bygg').",
                  "invoiceNumber": "Fakturanumret, om det kan utläsas.",
                  "amount": "Det totala beloppet, som ett nummer (använd punkt som decimalavskiljare).",
                  "currency": "Valutan (t.ex. 'SEK').",
                  "dueDate": "Förfallodatumet i formatet YYYY-MM-DD, om det kan utläsas.",
                  "suggestedNextStep": "Föreslå ett konkret nästa steg, t.ex. 'Skicka för attestering till projektledare' eller 'Lägg in för betalning enligt förfallodatum'."
                }
            `;

        default:
            // För andra typer kan vi ha enklare hantering eller inga åtgärder alls
            return '';
    }
};

export async function POST(request: NextRequest) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        console.error("[AI Extract] GEMINI_API_KEY är inte konfigurerad.");
        return NextResponse.json({ message: "Serverkonfigurationsfel: AI-motorn är inte konfigurerad." }, { status: 500 });
    }

    try {
        // Denna API-rutt anropas nu av en annan server-side rutt (cron job),
        // så vi kan inte använda getServerSession på samma sätt. Vi måste skicka med userId.
        const email: ClassifiedEmail = await request.json();

        if (!email.userId) {
            return NextResponse.json({ error: 'Användar-ID saknas i förfrågan.' }, { status: 400 });
        }

        const prompt = getActionExtractionPrompt(email);
        if (!prompt) {
            return NextResponse.json({ message: `Ingen åtgärd definierad för ${email.classification}.` }, { status: 200 });
        }

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const rawText = result.response.text();

        let actionData;
        try {
            const cleanedText = rawText.replace(/```json\n|```/g, '').trim();
            actionData = JSON.parse(cleanedText);
        } catch (e) {
            console.error('JSON Parsing Error för användare', email.userId, e);
            console.error('Rådata från AI:', rawText);
            return NextResponse.json({ error: 'Kunde inte tolka AI-svaret.' }, { status: 500 });
        }

        // Spara den extraherade åtgärden i Firestore
        const db = adminDb;
        const actionRef = db.collection('users').doc(email.userId).collection('actions').doc();
        
        await actionRef.set({
            ...actionData,
            userId: email.userId,
            status: 'new', // Initial status
            createdAt: new Date(),
            sourceEmail: {
                id: email.id,
                from: email.from,
                subject: email.subject,
            }
        });

        console.log(`[AI Extract] Sparade ny åtgärd ${actionRef.id} för användare ${email.userId}`);

        return NextResponse.json({ success: true, actionId: actionRef.id });

    } catch (error) {
        console.error('Fel i extract-actions API:', error);
        return NextResponse.json({ error: 'Ett internt serverfel uppstod.' }, { status: 500 });
    }
}
