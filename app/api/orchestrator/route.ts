
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { ChatMessage, Customer, Project, ProjectStatus } from '@/app/types';
import { headers } from 'next/headers';
import { listFilesAndFolders } from '@/app/services/driveService';

const lastAssistantMessageContains = (messages: ChatMessage[], text: string): boolean => {
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
    return !!lastAssistantMessage && lastAssistantMessage.content.includes(text);
};

const sendReply = (content: string) => NextResponse.json({ reply: { role: 'assistant', content } });

// --- Återanvändbara flöden ---

async function handleCustomerSelected(customerId: string, customerName: string, cookie: string, protocol: string, host: string) {
    const projectApiUrl = `${protocol}://${host}/api/projects/list?customerId=${customerId}`;
    const projects: Project[] = await (await fetch(projectApiUrl, { headers: { 'Cookie': cookie } })).json();
    let msg = `Ok, kund \"${customerName}\" är vald. `;
    msg += projects.length > 0 ? `Vilket projekt gäller det?\n` + projects.map(p => `\\[${p.name}\\]`).join(' ') : '';
    msg += `\n\nAnnars kan du \n[Skapa nytt projekt].`;
    return sendReply(msg);
}

// Hjälpfunktion för att extrahera data från tidigare meddelanden
const extractDataFromMessage = (messages: ChatMessage[], regex: RegExp): string | null => {
    const messageContent = messages.filter(m => m.role === 'assistant').pop()?.content || '';
    const match = messageContent.match(regex);
    return match ? match[1] : null;
};

// --- Huvudlogik för API-rutten ---

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const host = headers().get('host')!;
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const cookie = headers().get('cookie') || '';

    const { messages, trigger } = await request.json();
    const lastUserMessage = messages[messages.length - 1];

    if (trigger === 'quote_start') {
      return sendReply("Jag kan hjälpa dig skapa en offert. För vilken kund?");
    }

    if (lastUserMessage.role !== 'user') {
        return sendReply("Jag väntar på ditt svar.");
    }

    // 1. Svar på kundfrågan
    if (lastAssistantMessageContains(messages, "För vilken kund?")) {
        const searchTerm = lastUserMessage.content;
        if (searchTerm === 'Skapa ny kund') return sendReply("Ok, vi skapar en ny kund. Är det ett Företag eller en Privatperson?");
        if (searchTerm === 'Avbryt') return sendReply("Ok, jag avbryter.");

        const customers: Customer[] = await (await fetch(`${protocol}://${host}/api/customers/list`, { headers: { 'Cookie': cookie } })).json();
        const found = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        let reply = found.length > 0 ? `Hittade: \n` + found.map(c => `\\[${c.name}\\]`).join(' ') : `Hittade inte "${searchTerm}".`;
        reply += "\n\n[Skapa ny kund] eller [Avbryt].";
        return sendReply(reply);
    }

    // 2. Svar på Företag / Privatperson
    if (lastAssistantMessageContains(messages, "Företag eller en Privatperson?")) {
        if (lastUserMessage.content === 'Företag') {
            return sendReply("Ange företagets organisationsnummer.");
        }
        return sendReply("Ok. Ange info: `Namn, E-post, Telefon`");
    }

    // 3. Användaren anger ett organisationsnummer
    if (lastAssistantMessageContains(messages, "Ange företagets organisationsnummer.")) {
        const orgnr = lastUserMessage.content;
        const verifyResponse = await fetch(`${protocol}://${host}/api/verify-company`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgnr })
        });

        if (!verifyResponse.ok) {
            return sendReply(`Kunde inte verifiera numret. Försök igen eller [Avbryt].`);
        }

        const companyData = await verifyResponse.json();
        const { foretagsnamn, adress, status } = companyData;
        const fullAddress = `${adress.utdelningsadress1}, ${adress.postnummer} ${adress.postort}`;
        
        const reply = `Jag hittade: **${foretagsnamn}** (${status.status}).\nAdress: ${fullAddress}.\n\nStämmer detta? \n[Ja, skapa kund med dessa uppgifter] [Nej, försök igen]`;
        return sendReply(reply);
    }
    
    // 4. Användaren bekräftar den verifierade företagsdatan
    if (lastAssistantMessageContains(messages, "Stämmer detta?")) {
        if(lastUserMessage.content === 'Nej, försök igen') {
            return sendReply("Ok. Ange organisationsnummer igen.");
        }
        
        const companyName = extractDataFromMessage(messages, /\*\*(.*?)\*\*/);
        if (!companyName) return sendReply("Ett internt fel uppstod. Jag kunde inte hitta företagsnamnet. Försök igen.");

        const newCustomer: Customer = await (await fetch(`${protocol}://${host}/api/customers/create`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }, 
            body: JSON.stringify({ name: companyName, isCompany: true })
        })).json();
        
        return handleCustomerSelected(newCustomer.id, newCustomer.name, cookie, protocol, host);
    }

    // 5. Skapa ny privatperson
    if (lastAssistantMessageContains(messages, "Ange info: `Namn, E-post, Telefon`")) {
        const [name, email, phone] = lastUserMessage.content.split(',').map((p: string) => p.trim());
        if (!name || !email) return sendReply("Fel format. Försök igen: `Namn, E-post, Telefon`");
        const newCustomer: Customer = await (await fetch(`${protocol}://${host}/api/customers/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }, body: JSON.stringify({ name, email, phone, isCompany: false }) })).json();
        return handleCustomerSelected(newCustomer.id, newCustomer.name, cookie, protocol, host);
    }

    // 6. Välj befintlig kund
    if (lastAssistantMessageContains(messages, "Hittade:")) {
        const customerName = lastUserMessage.content.replace(/\\[|\\]/g, '');
        const customers: Customer[] = await (await fetch(`${protocol}://${host}/api/customers/list`, { headers: { 'Cookie': cookie } })).json();
        const chosen = customers.find(c => c.name === customerName);
        if (!chosen) return sendReply(`Kunde inte hitta \"${customerName}\".`);
        return handleCustomerSelected(chosen.id, chosen.name, cookie, protocol, host);
    }
    
    // 7. Användaren vill skapa ett nytt projekt
    if (lastUserMessage.content === 'Skapa nytt projekt') {
        // Spara kundnamnet från föregående assistent-meddelande för att använda det senare
        const customerName = extractDataFromMessage(messages, /kund \"(.*?)\"/);
        return sendReply(`Ok, vi skapar ett nytt projekt för kunden \"${customerName}\". Vilket namn ska projektet ha?`);
    }

    // 8. Användaren har angett ett projektnamn
    if (lastAssistantMessageContains(messages, "Vilket namn ska projektet ha?")) {
        const newProjectName = lastUserMessage.content;
        const customerName = extractDataFromMessage(messages, /kunden \"(.*?)\"/);

        // Hämta hela kundobjektet för att få kund-ID
        const customers: Customer[] = await (await fetch(`${protocol}://${host}/api/customers/list`, { headers: { 'Cookie': cookie } })).json();
        const customer = customers.find(c => c.name === customerName);

        if (!customer) {
            return sendReply(`Ett fel uppstod: Jag kunde inte hitta kund-ID för \"${customerName}\". Avbryter.`);
        }

        const response = await fetch(`${protocol}://${host}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({
                name: newProjectName,
                customerId: customer.id,
                customerName: customer.name,
                status: ProjectStatus.QUOTE // Sätter status till "Anbud"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return sendReply(`Kunde inte skapa projektet: ${errorData.message}. Försök igen.`);
        }

        const newProject: Project = await response.json();
        return sendReply(`Projektet \"${newProject.name}\" har skapats åt kunden ${customer.name} och en Google Drive-mapp har skapats. Vad vill du göra nu?`);
    }

    // 9. Välj befintligt projekt
    if (lastAssistantMessageContains(messages, "Vilket projekt gäller det?")) {
        const projectName = lastUserMessage.content.replace(/\\[|\\]/g, '');
        
        const projects: Project[] = await (await fetch(`${protocol}://${host}/api/projects/list`, { headers: { 'Cookie': cookie } })).json();
        const project = projects.find(p => p.name === projectName);
        if (!project) return sendReply(`Hittade inte projekt \"${projectName}\".`);
        if (!project.driveFolderId) return sendReply(`Projekt \"${projectName}\" saknar en Drive-mapp.`);

        const files = await listFilesAndFolders(project.driveFolderId);
        let reply = files.length > 0 ? `Hittade filer... Vilka ska inkluderas?\n` + files.map(f => `\\[${f.name}\\]`).join(' ') : `Hittade inga filer.`;
        reply += `\n\n[Ingen av dessa] eller [Avbryt].`;
        return sendReply(reply);
    }

    // 10. Generera offertförslag (Simulerad AI)
    if (lastAssistantMessageContains(messages, "Vilka ska inkluderas?")) {
        const fileName = lastUserMessage.content.replace(/\\[|\\]/g, '');
        if (fileName === 'Ingen av dessa' || fileName === 'Avbryt') return sendReply("Ok, avbryter.");

        let summary = `Analyserar \"${fileName}\". Förslag:\n*   Rivning vägg: 8 tim\n*   Ny vägg: 16 tim\n*   Material: 5400 kr\n*   Avfall: 2 tim\n\nVill du \n[Spara och skicka] eller [Gör ändringar]?`;
        return sendReply(summary);
    }

    // Fallback
    return sendReply(`Jag är osäker på hur jag ska tolka "${lastUserMessage.content}".`);

  } catch (error) {
    console.error("Error in Orchestrator API: ", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
