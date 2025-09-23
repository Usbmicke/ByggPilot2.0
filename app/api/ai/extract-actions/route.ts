
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Typdefinition för ett inkommande, klassificerat e-postmeddelande
interface ClassifiedEmail {
    id: string;
    from: string;
    subject: string;
    snippet: string;
    classification: string; // t.ex. 'Kundförfrågan', 'Leverantörsfaktura'
}

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
    try {
        const email: ClassifiedEmail = await request.json();

        const prompt = getActionExtractionPrompt(email);

        if (!prompt) {
            return NextResponse.json({ message: `Ingen åtgärd definierad för klassificeringen \"${email.classification}\".` }, { status: 200 });
        }

        // Initiera AI-modellen
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();
        
        // Försök att parsa texten som JSON. Detta är ett kritiskt steg.
        let actionData;
        try {
             // Vi måste rensa bort eventuella markdown-formateringar som AI:n kan lägga till
            const cleanedText = rawText.replace(/```json\n|```/g, '').trim();
            actionData = JSON.parse(cleanedText);
        } catch (e) {
            console.error('JSON Parsing Error:', e);
            console.error('Raw AI Response:', rawText); // Logga rådata för felsökning
            return NextResponse.json({ error: 'Kunde inte tolka AI-svaret som giltig JSON.' }, { status: 500 });
        }

        // I ett riktigt flöde skulle `actionData` nu sparas i en `actions`-tabell i databasen,
        // redo att presenteras för användaren.
        console.log('--- [AI ÅTGÄRDS-EXTRAKTION LYCKADES] ---');
        console.log(actionData);
        console.log('-------------------------------------');

        return NextResponse.json(actionData);

    } catch (error) {
        console.error('Fel i extract-actions API:', error);
        return NextResponse.json({ error: 'Ett internt serverfel uppstod.' }, { status: 500 });
    }
}
