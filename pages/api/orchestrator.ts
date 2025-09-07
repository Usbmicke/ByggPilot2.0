
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';

// Typer och konfiguration är oförändrade...

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type OrchestratorRequest = { messages: ChatMessage[]; trigger?: 'onboarding_start' | 'quote_start' };
type OrchestratorResponse = { reply: ChatMessage };

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("FATAL: GOOGLE_API_KEY is not set.");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const masterPrompt = `...`;
const onboardingStartPrompt = `...`;
const quoteStartPrompt = `...`; // Prompts är oförändrade, utelämnade för läsbarhet

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<OrchestratorResponse | { error: string }>
) {
    // ... (metod- och API-nyckelkontroller är oförändrade)
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'AI service not configured.' });

    try {
        const { messages, trigger }: OrchestratorRequest = req.body;
        if (!messages) return res.status(400).json({ error: 'No messages provided' });

        let systemPrompt = masterPrompt;
        if (trigger === 'onboarding_start') {
            systemPrompt = onboardingStartPrompt;
        } else if (trigger === 'quote_start') {
            systemPrompt = quoteStartPrompt;
        }

        const history: Content[] = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Jag är ByggPilot, redo att hjälpa till." }] },
            ...messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }))
        ];
        
        const chat = model.startChat({ history });
        const lastMessageText = trigger ? `@${trigger}` : messages[messages.length - 1]?.content || '';
        const result = await chat.sendMessage(lastMessageText);
        let aiResponseText = result.response.text();

        const actionRegex = / \[ACTION:(\w+)\]({.*?})?/;
        const actionMatch = aiResponseText.match(actionRegex);

        if (actionMatch) {
            const action = actionMatch[1];
            const jsonDataString = actionMatch[2];
            aiResponseText = aiResponseText.replace(actionRegex, '').trim();
            
            const cookie = req.headers.cookie;
            const apiBaseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

            if (action === 'CREATE_DRIVE_STRUCTURE') {
                const response = await fetch(`${apiBaseUrl}/api/google/drive/create-folders`, {
                    method: 'POST',
                    headers: { 'Cookie': cookie || '' },
                });
                aiResponseText = response.ok 
                    ? "Sådär! En ny mappstruktur har skapats i din Google Drive."
                    : "Tyvärr, något gick fel när jag försökte skapa mapparna.";

            } else if (action === 'CREATE_QUOTE_DOCUMENT') {
                if (!jsonDataString) {
                    aiResponseText = "Jag lyckades inte samla in informationen korrekt. Vi måste försöka igen.";
                } else {
                    const quoteData = JSON.parse(jsonDataString);
                    const response = await fetch(`${apiBaseUrl}/api/google/docs/create-quote`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cookie': cookie || '',
                        },
                        body: JSON.stringify(quoteData),
                    });

                    if (response.ok) {
                        aiResponseText = "Utmärkt! Jag har skapat ett utkast för offerten och lagt det i din Google Drive. Vill du att jag ska göra något mer?";
                    } else {
                        aiResponseText = "Jag kunde inte skapa offertdokumentet just nu. Något gick fel på vägen. Vill du försöka igen?";
                    }
                }
            }
        }
        
        const reply: ChatMessage = { role: 'assistant', content: aiResponseText };
        res.status(200).json({ reply });

    } catch (error) {
        console.error('Error in orchestrator:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
