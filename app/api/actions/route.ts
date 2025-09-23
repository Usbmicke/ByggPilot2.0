
import { NextResponse } from 'next/server';

// Detta är en simulerad databas-fråga som hämtar färdigbearbetade "åtgärder" eller "förslag".
// I en verklig applikation skulle detta vara resultatet av att `extract-actions`-skriptet 
// har kört och sparat sina resultat i en Firestore-databas.
const getSuggestedActions = async () => {
    return [
        {
            "actionType": "PROJECT_LEAD",
            "sourceEmailId": "msg-101",
            "summary": "Nytt projekt: Altanbygge i Nacka",
            "contact": {
                "name": "Kalle Svensson",
                "email": "kalle.svensson@gmail.com",
                "phone": null
            },
            "details": "Kunden vill ha en offert på ett altanbygge på cirka 30 kvadratmeter.",
            "suggestedNextStep": "Boka ett platsbesök för att diskutera detaljer och mått.",
            "status": "new"
        },
        {
            "actionType": "INVOICE_PROCESSING",
            "sourceEmailId": "msg-102",
            "vendorName": "Beijer Bygg",
            "invoiceNumber": "2024-50123",
            "amount": 15432,
            "currency": "SEK",
            "dueDate": "2024-07-30",
            "suggestedNextStep": "Skicka för attestering till ansvarig projektledare.",
            "status": "new"
        },
        {
            "actionType": "PROJECT_LEAD",
            "sourceEmailId": "msg-205",
            "summary": "Takomläggning villa i Täby",
            "contact": {
                "name": "Anna Andersson",
                "email": "anna.a@hotmail.com",
                "phone": "070-123 45 67"
            },
            "details": "Hela villataket behöver läggas om. Gäller både tegel och papp. Önskar en skyndsam offert.",
            "suggestedNextStep": "Ta fram en initial offert baserat på informationen och föreslå en tid för inspektion.",
            "status": "new"
        }
    ];
}

export async function GET() {
    try {
        const actions = await getSuggestedActions();
        return NextResponse.json(actions);
    } catch (error) {
        console.error('Fel i actions API:', error);
        return NextResponse.json({ error: 'Kunde inte hämta föreslagna åtgärder.' }, { status: 500 });
    }
}
