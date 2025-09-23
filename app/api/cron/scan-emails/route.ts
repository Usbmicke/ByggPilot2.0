
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- SIMULERAD DATABAS & E-POST INKORG ---

// I verkligheten skulle vi hämta en giltig, krypterad refresh_token från databasen.
const getRefreshTokenForUser = async (userId: string) => {
    console.log(`Hämtar refresh_token för användare ${userId}...`);
    return 'simulated_refresh_token_for_user_123';
};

// Simulerar ett API-anrop till Google Gmail för att hämta nya e-postmeddelanden.
const fetchNewEmails = async (accessToken: string) => {
    console.log(`Använder access_token \"${accessToken}...\" för att hämta e-post.`);
    // Detta är vår simulerade inkorg med en blandning av relevanta och irrelevanta meddelanden.
    return [
        {
            id: 'msg-101',
            from: 'Kalle Svensson <kalle.svensson@gmail.com>',
            subject: 'Offertförfrågan - Altanbygge i Nacka',
            snippet: 'Hej, vi skulle vilja få en offert på ett altanbygge på ca 30kvm. Mvh Kalle'
        },
        {
            id: 'msg-102',
            from: 'noreply@beijerbygg.se',
            subject: 'Er faktura 2024-50123 har skapats',
            snippet: 'Hej Byggbolaget AB, en ny faktura finns nu att ladda ner. Belopp: 15,432 SEK. Förfallodatum:...'
        },
        {
            id: 'msg-103',
            from: 'Bauhaus Nyhetsbrev <nyhetsbrev@bauhaus.se>',
            subject: 'Veckans erbjudanden på verktyg!',
            snippet: 'Missa inte 20% på alla sågar från Makita! Perfekt för sommarens projekt.'
        },
        {
            id: 'msg-104',
            from: 'Skatteverket <noreply@skatteverket.se>',
            subject: 'Viktigt meddelande från Skatteverket',
            snippet: 'Du har ett nytt meddelande i din digitala brevlåda. Logga in på Mina Sidor för att läsa det.'
        },
        {
            id: 'msg-105',
            from: 'Lotta på Supporten <lotta@visma.com>',
            subject: 'Angående din fråga om momsredovisning',
            snippet: 'Hej, jag har tittat på ditt ärende och här kommer ett svar...'
        },
        {
            id: 'msg-106',
            from: '\"Prince of Nigeria\" <scammer@scam.com>',
            subject: 'URGENT BUSINESS PROPOSAL!!!',
            snippet: 'Greetings, I am a prince with 100,000,000 USD that I need to transfer...'
        }
    ];
};

// --- KÄRNLOGIKEN FÖR CRON-JOBBET ---

export async function GET() {
    console.log('\n--- [CRON-JOBB STARTAR]: Söker efter relevanta e-postmeddelanden... ---');

    // Validera att API-nyckeln för Gemini finns
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        console.error("[Cron Job] GEMINI_API_KEY är inte konfigurerad i miljövariablerna.");
        return NextResponse.json({ message: "Serverkonfigurationsfel: AI-motorn är inte konfigurerad." }, { status: 500 });
    }

    // 1. Hämta användarens token (Simulering)
    const refreshToken = await getRefreshTokenForUser('user_123');
    // I verkligheten: Byt refresh_token mot en ny access_token
    const newAccessToken = `new_access_token_from_${refreshToken.substring(0, 20)}`;

    // 2. Hämta nya e-postmeddelanden (Simulering)
    const emails = await fetchNewEmails(newAccessToken);
    console.log(`Hämtade ${emails.length} nya e-postmeddelanden.`);

    // 3. Initiera AI-modellen
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 4. Bearbeta varje e-post med AI för klassificering
    const processingPromises = emails.map(async (email) => {
        const prompt = `
            Du är en AI-assistent i ett svenskt byggföretag. 
            Analysera metadata från följande e-post och klassificera dess avsikt. 
            Svara ENDAST med en av följande kategorier: [Kundförfrågan], [Leverantörsfaktura], [Myndighetskontakt], [Supportärende], [Potentiell Bluff], [Ignorera].

            Avsändare: ${email.from}
            Ämne: ${email.subject}
            Utdrag: ${email.snippet}
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const classification = response.text().trim().replace(/[\[\]]/g, ''); // Rensa bort ev. hakparenteser
            return { ...email, classification };
        } catch (error) {
            console.error('Fel vid AI-klassificering:', error);
            return { ...email, classification: 'Fel' };
        }
    });

    const classifiedEmails = await Promise.all(processingPromises);

    // 5. Logga och returnera resultatet
    console.log('\n--- AI-KLASSIFICERING RESULTAT ---');
    const relevantEmails = [];
    classifiedEmails.forEach(email => {
        const logMessage = `[${email.classification.padEnd(18)}] - ${email.subject}`;
        console.log(logMessage);

        if (email.classification !== 'Ignorera' && email.classification !== 'Potentiell Bluff' && email.classification !== 'Fel') {
            relevantEmails.push(email);
        }
    });
    console.log('--- [CRON-JOBB SLUTFÖRT] ---\n');

    // I nästa steg skulle `relevantEmails` sparas i en databas för att presenteras för användaren.

    return NextResponse.json({
        message: 'E-post-skanning slutförd. Se serverloggar för detaljer.',
        results: classifiedEmails,
        relevantCount: relevantEmails.length
    });
}
