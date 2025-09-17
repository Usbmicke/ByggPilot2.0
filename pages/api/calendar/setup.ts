import { NextApiRequest, NextApiResponse } from 'next';

// Mock API endpoint för att simulera integration med Google Kalender.
// I en verklig applikation skulle denna endpoint:
// 1. Initiera ett OAuth2-flöde med Google.
// 2. Be om tillåtelse till användarens kalender.
// 3. Spara en refresh token i databasen för framtida bruk.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Simulera en fördröjning
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log("API-anrop mottaget till /api/calendar/setup");
        console.log("Body:", req.body);

        res.status(200).json({ success: true, message: "Kalender kopplad (simulerat)." });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
