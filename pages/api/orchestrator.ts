
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]'; // Korrigerad import

// Detta är en platshållar-databas för kundinformation. I en riktig applikation
// skulle detta hämtas från Google Contacts API eller en annan databas.
const customers = [
    { id: 'cust_123', name: 'Testkund AB' },
    { id: 'cust_456', name: 'Bygg-Firma Andersson' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const { messages, trigger } = req.body;

    // Om det finns en trigger (t.ex. från en knapptryckning), hantera den först.
    if (trigger === 'quote_start') {
        return res.status(200).json({ 
            reply: { 
                role: 'assistant', 
                content: 'Självklart! Vi skapar en offert. Vilken kund gäller det?\n\\[Testkund AB\\]\n\\[Bygg-Firma Andersson\\]' 
            }
        });
    }
    
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
        return res.status(200).json({ reply: { role: 'assistant', content: 'Hej! Hur kan jag hjälpa dig?' } });
    }

    // Leta efter en kund i meddelandet
    const selectedCustomer = customers.find(c => lastUserMessage.content.includes(c.name));

    if (selectedCustomer) {
        // HÄR ÄR ÄNDRINGEN!
        // Vi har hittat en kund. Nu anropar vi create-quote med rätt data.
        // Notera: Detta är ett internt anrop från en API-rutt till en annan. 
        // Detta är inte idealiskt, men det är en startpunkt för att få flödet att fungera.
        try {
            const quoteResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/google/docs/create-quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Skicka med användarens session för autentisering i nästa API-anrop
                    'Cookie': req.headers.cookie || '' 
                },
                body: JSON.stringify({
                    customerId: selectedCustomer.id,
                    customerName: selectedCustomer.name,
                    projectType: 'Standard', // Platshållardata
                    address: 'Okänd',       // Platshållardata
                    description: 'Baserat på vår konversation', // Platshållardata
                    materials: 'Enligt specifikation' // Platshållardata
                })
            });

            if (!quoteResponse.ok) {
                const errorData = await quoteResponse.json();
                throw new Error(errorData.details || 'Failed to create quote internally');
            }

            const quoteData = await quoteResponse.json();

            return res.status(200).json({ 
                reply: { 
                    role: 'assistant',
                    content: `Perfekt! Jag har skapat en offert för ${selectedCustomer.name}. Du kan granska den här: ${quoteData.url}` 
                }
            });

        } catch(error: any) {
             console.error("Error in orchestrator calling create-quote:", error);
             return res.status(500).json({ error: 'Kunde inte skapa offerten', details: error.message });
        }
    }

    // Standard-svar om ingen avsikt känns igen
    return res.status(200).json({ 
        reply: { role: 'assistant', content: "Jag är inte säker på att jag förstår. Kan du försöka igen?" } 
    });
}
