
import { NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/admin';
import { decrypt } from '@/lib/encryption';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Hjälpfunktioner för att initiera AI och OAuth2-klient
const getAIModel = () => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY är inte konfigurerad.");
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

const getOAuth2Client = () => {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error("Google OAuth-klientuppgifter är inte konfigurerade.");
    return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/integrations/google/callback');
};

// Funktion för att hämta nya e-postmeddelanden från Gmail
const fetchNewEmailsForUser = async (userId: string, refreshToken: string) => {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const { token: accessToken } = await oauth2Client.getAccessToken();
    if (!accessToken) throw new Error(`Kunde inte förnya access token för användare ${userId}`);
    
    const response = await gmail.users.messages.list({ userId: 'me', q: 'is:unread', maxResults: 15 });
    const messages = response.data.messages || [];
    if (messages.length === 0) return [];

    const emailPromises = messages.map(async (message) => {
        const msg = await gmail.users.messages.get({ userId: 'me', id: message.id!, format: 'metadata', metadataHeaders: ['Subject', 'From'] });
        return {
            id: msg.data.id!,
            snippet: msg.data.snippet!,
            from: msg.data.payload?.headers?.find(h => h.name === 'From')?.value || '',
            subject: msg.data.payload?.headers?.find(h => h.name === 'Subject')?.value || '',
        };
    });
    return Promise.all(emailPromises);
};

// Funktion för att klassificera ett e-postmeddelande med AI
const classifyEmail = async (email: any) => {
    const model = getAIModel();
    const prompt = `Du är en AI-assistent i ett svenskt byggföretag. Klassificera avsikten med följande e-post. Svara ENDAST med en av: [Kundförfrågan], [Leverantörsfaktura], [Myndighetskontakt], [Supportärende], [Potentiell Bluff], [Ignorera].\n\nAvsändare: ${email.from}\nÄmne: ${email.subject}\nUtdrag: ${email.snippet}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/[\[\]]/g, '');
};

// Funktion för att skicka vidare till åtgärdsextrahering
const triggerActionExtraction = async (email: any, classification: string, userId: string, baseUrl: string) => {
    const response = await fetch(`${baseUrl}/api/ai/extract-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...email, classification, userId }),
    });
    if (!response.ok) {
        console.error(`[Cron Job] Fel vid anrop till extract-actions för e-post ${email.id}:`, await response.text());
    }
};

// Huvudfunktion för Cron-jobbet
export async function GET(request: Request) {
    console.log('\n--- [CRON-JOBB STARTAR]: Söker efter relevanta e-postmeddelanden... ---');
    const requestUrl = new URL(request.url);
    const baseUrl = requestUrl.origin;

    try {
        getAIModel();
        getOAuth2Client();
    } catch (error: any) {
        console.error(`[Cron Job] Serverkonfigurationsfel: ${error.message}`);
        return NextResponse.json({ message: `Serverkonfigurationsfel: ${error.message}` }, { status: 500 });
    }

    const db = firestoreAdmin;
    const usersSnapshot = await db.collection('users').where('hasGoogleIntegration', '==', true).get();

    if (usersSnapshot.empty) {
        return NextResponse.json({ message: "Inga aktiva integrationer." });
    }

    let totalProcessedEmails = 0;

    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        console.log(`\nBearbetar användare: ${userId}`);

        try {
            const integrationDoc = await db.collection('users').doc(userId).collection('integrations').doc('google').get();
            if (!integrationDoc.exists || !integrationDoc.data()?.refreshToken) continue;

            const refreshToken = decrypt(integrationDoc.data()!.refreshToken);
            const emails = await fetchNewEmailsForUser(userId, refreshToken);
            if (emails.length === 0) continue;

            console.log(`Hämtade ${emails.length} nya e-postmeddelanden för ${userId}.`);

            for (const email of emails) {
                const classification = await classifyEmail(email);
                console.log(`[${classification.padEnd(18)}] - ${email.subject}`);

                if (!['Ignorera', 'Potentiell Bluff', 'Fel'].includes(classification)) {
                    await triggerActionExtraction(email, classification, userId, baseUrl);
                }
            }
            totalProcessedEmails += emails.length;

        } catch (error) {
            console.error(`[Cron Job] Ett fel inträffade vid bearbetning av användare ${userId}:`, error);
        }
    }

    console.log('--- [CRON-JOBB SLUTFÖRT] ---\n');
    return NextResponse.json({ message: "E-post-skanning slutförd.", processedUsers: usersSnapshot.size, totalProcessedEmails });
}
