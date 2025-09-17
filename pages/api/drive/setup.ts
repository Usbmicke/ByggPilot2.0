import { NextApiRequest, NextApiResponse } from 'next';

// Mock API endpoint för att simulera skapandet av en Drive-struktur.
// I en verklig applikation skulle denna endpoint:
// 1. Verifiera användarens autentisering (t.ex. via en JWT eller session).
// 2. Använda Google Drive API för att skapa mapparna.
// 3. Returnera ett framgångs- eller felmeddelande.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Simulera en fördröjning som ett nätverksanrop skulle ha
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Logga för att se att anropet tas emot (kan ses i Next.js terminalen)
        console.log("API-anrop mottaget till /api/drive/setup");
        console.log("Body:", req.body);

        // Skicka ett framgångssvar
        res.status(200).json({ success: true, message: "Mappstruktur skapad (simulerat)." });
    } else {
        // Hantera andra HTTP-metoder
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
