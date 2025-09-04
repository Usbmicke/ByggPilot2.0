import { ChatMessage, MessageSender } from '@/app/types';

interface ScriptItem {
    message: ChatMessage;
    delay: number;
}

export const quoteFlowScript: ScriptItem[] = [
    {
        message: { id: 'q-1', sender: MessageSender.AI, text: 'Perfekt! Då kör vi igång en ny offert.' },
        delay: 1500
    },
    {
        message: { id: 'q-2', sender: MessageSender.AI, text: 'Vem är kunden? Du kan skriva namnet eller välja från din kundlista.' },
        delay: 2000
    },
    {
        message: { id: 'q-user-1', sender: MessageSender.USER, text: 'Familjen Persson' },
        delay: 1000
    },
    {
        message: { id: 'q-3', sender: MessageSender.AI, text: 'Toppen. Gäller det en ny adress eller Parkvägen 12?' },
        delay: 2000
    },
    {
        message: { id: 'q-user-2', sender: MessageSender.USER, text: 'Samma adress' },
        delay: 1500
    },
    {
        message: { id: 'q-4', sender: MessageSender.AI, text: 'Ok. Vad är det för typ av jobb? T.ex. “Altanbygge” eller “Badrumsrenovering”.' },
        delay: 2200
    },
    {
        message: { id: 'q-user-3', sender: MessageSender.USER, text: 'Bygga en ny altan på baksidan' },
        delay: 1000
    },
    {
        message: { id: 'q-5', sender: MessageSender.AI, text: 'Förstått. Har du några ritningar, bilder eller andra underlag du vill ladda upp?' },
        delay: 2000
    },
    {
        message: { id: 'q-user-4', sender: MessageSender.USER, text: 'Nej, inte just nu.' },
        delay: 1500
    },
    {
        message: { id: 'q-6', sender: MessageSender.AI, text: 'Inga problem. Jag skapar ett nytt projektkort och en mappstruktur i Google Drive för “Altanbygge - Familjen Persson”.' },
        delay: 2500
    },
    {
        message: { id: 'q-7', sender: MessageSender.AI, text: 'Projektet är nu skapat under “Planering”. Du kan gå in där för att lägga till mer detaljer och påbörja din kalkyl.' },
        delay: 1000
    },
];
