
import { NextRequest, NextResponse } from 'next/server';
import { ChatMessage } from '@/app/types';

// Detta är en grundläggande konversationslogik för ByggPilot.
// Den följer direktiven: korta svar, en motfråga.
function getNextResponse(userMessage: string): string {
    const lowerCaseMessage = userMessage.toLowerCase();

    if (lowerCaseMessage.includes('checklista') || lowerCaseMessage.includes('kma')) {
        return `Absolut, här är en enkel checklista så att jobbet går säkert och smidigt, och du har ryggen fri.\n\n**Checklista: Daglig Säkerhetskontroll**\n1.  **Personlig Skyddsutrustning:** Är hjälm, skyddsglasögon och skyddsskor på?\n2.  **Verktygskontroll:** Är alla verktyg i gott skick?\n3.  **Arbetsområde:** Är området avspärrat och skyltat?\n\nVill du att jag ska specificera checklistan för ett särskilt arbetsmoment, till exempel takarbete?`;
    }

    if (lowerCaseMessage.includes('hej') || lowerCaseMessage.includes('tja')) {
        return "Hej igen! Kul att du är igång. Har du hunnit fundera på din roll på företaget? Det hjälper mig att anpassa mina råd.";
    }

    if (lowerCaseMessage.includes('projekt')) {
        return "Projekt ja, det är kärnan i allt. För att skapa ett nytt projekt behöver jag veta kundens namn och vad projektet gäller. Har du den informationen till hands?";
    }

    // Standardfråga om användaren verkar beskriva sin roll
    if (lowerCaseMessage.includes('snickare') || lowerCaseMessage.includes('projektledare') || lowerCaseMessage.includes('vd') || lowerCaseMessage.includes('anläggare')) {
        return "Tack, det är värdefull information. Då förstår jag din vardag lite bättre. Är det något särskilt du behöver hjälp med just nu, kanske skapa en offert eller ett nytt projekt?";
    }

    return "Intressant. Kan du utveckla det lite mer? Ju mer jag förstår om dina utmaningar, desto bättre kan jag hjälpa till.";
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const messages: ChatMessage[] = body.messages;

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'Inga meddelanden skickades.' }, { status: 400 });
        }

        // Hämta det sista meddelandet från användaren
        const lastUserMessage = messages[messages.length - 1];

        if (lastUserMessage.role !== 'user') {
            return NextResponse.json({ error: 'Det sista meddelandet är inte från en användare.' }, { status: 400 });
        }

        // Använd vår regelbaserade logik för att få ett svar
        const responseText = getNextResponse(lastUserMessage.content);

        const assistantResponse: ChatMessage = {
            role: 'assistant',
            content: responseText
        };

        // Simulera en liten fördröjning för en mer realistisk upplevelse
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({ message: assistantResponse });

    } catch (error) {
        console.error("[API/CHAT] Error:", error);
        const errorMessage: ChatMessage = {
            role: 'assistant',
            content: "Jag stötte på ett oväntat tekniskt fel. Mitt team har meddelats. Försök gärna igen om en liten stund."
        };
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
