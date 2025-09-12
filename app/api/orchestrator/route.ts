
import { NextResponse } from 'next/server';
// STEP 1: Replace iron-session with next-auth
import { getServerSession } from '@/app/lib/auth'; 
import { ChatMessage, Customer, Project, ProjectStatus } from '@/app/types';
import { headers } from 'next/headers';
import { listFilesAndFolders } from '@/app/services/driveService';

// This is a temporary solution. In a real app, you'd have a proper service layer.
// For now, we are simulating the behavior of the old fetch calls.
import { listProjects } from '@/app/services/projectService'; 
import { listCustomers, createCustomer } from '@/app/services/customerService';
import { createProject } from '@/app/services/projectService';


const lastAssistantMessageContains = (messages: ChatMessage[], text: string): boolean => {
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
    return !!lastAssistantMessage && lastAssistantMessage.content.includes(text);
};

const sendReply = (content: string) => NextResponse.json({ reply: { role: 'assistant', content } });

// --- Reusable Flows ---

async function handleCustomerSelected(customerId: string, customerName: string, userId: string) {
    // REFACTOR: No longer uses fetch
    const projects: Project[] = await listProjects(userId, customerId);
    let msg = `Ok, kund \"${customerName}\" är vald. `;
    msg += projects.length > 0 ? `Vilket projekt gäller det?\n` + projects.map(p => `\\[${p.name}\\]`).join(' ') : '';
    msg += `\n\nAnnars kan du \n[Skapa nytt projekt].`;
    return sendReply(msg);
}

// Helper to extract data from previous messages
const extractDataFromMessage = (messages: ChatMessage[], regex: RegExp): string | null => {
    const messageContent = messages.filter(m => m.role === 'assistant').pop()?.content || '';
    const match = messageContent.match(regex);
    return match ? match[1] : null;
};

// --- Main API Route Logic ---

export async function POST(request: Request) {
  try {
    // STEP 2: Use the new session handler
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;

    const host = headers().get('host')!;
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    // STEP 3: Cookie is no longer needed
    // const cookie = headers().get('cookie') || '';

    const { messages, trigger } = await request.json();
    const lastUserMessage = messages[messages.length - 1];

    if (trigger === 'quote_start') {
      return sendReply("Jag kan hjälpa dig skapa en offert. För vilken kund?");
    }

    if (lastUserMessage.role !== 'user') {
        return sendReply("Jag väntar på ditt svar.");
    }

    // 1. Reply to "For which customer?"
    if (lastAssistantMessageContains(messages, "För vilken kund?")) {
        const searchTerm = lastUserMessage.content;
        if (searchTerm === 'Skapa ny kund') return sendReply("Ok, vi skapar en ny kund. Är det ett Företag eller en Privatperson?");
        if (searchTerm === 'Avbryt') return sendReply("Ok, jag avbryter.");

        // REFACTOR: No longer uses fetch
        const customers: Customer[] = await listCustomers(userId);
        const found = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        let reply = found.length > 0 ? `Hittade: \n` + found.map(c => `\\[${c.name}\\]`).join(' ') : `Hittade inte "${searchTerm}".`;
        reply += "\n\n[Skapa ny kund] eller [Avbryt].";
        return sendReply(reply);
    }

    // 2. Reply to "Company or Private Person?"
    if (lastAssistantMessageContains(messages, "Företag eller en Privatperson?")) {
        if (lastUserMessage.content === 'Företag') {
            return sendReply("Ange företagets organisationsnummer.");
        }
        return sendReply("Ok. Ange info: `Namn, E-post, Telefon`");
    }

    // 3. User provides an organization number
    if (lastAssistantMessageContains(messages, "Ange företagets organisationsnummer.")) {
        const orgnr = lastUserMessage.content;
        // This is an external call, so fetch is appropriate here.
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
    
    // 4. User confirms the verified company data
    if (lastAssistantMessageContains(messages, "Stämmer detta?")) {
        if(lastUserMessage.content === 'Nej, försök igen') {
            return sendReply("Ok. Ange organisationsnummer igen.");
        }
        
        const companyName = extractDataFromMessage(messages, /\*\*(.*?)\*\*/);
        if (!companyName) return sendReply("Ett internt fel uppstod. Jag kunde inte hitta företagsnamnet. Försök igen.");

        // REFACTOR: No longer uses fetch
        const newCustomer = await createCustomer({ name: companyName, isCompany: true, ownerId: userId });
        
        return handleCustomerSelected(newCustomer.id, newCustomer.name, userId);
    }

    // 5. Create new private person
    if (lastAssistantMessageContains(messages, "Ange info: `Namn, E-post, Telefon`")) {
        const [name, email, phone] = lastUserMessage.content.split(',').map((p: string) => p.trim());
        if (!name || !email) return sendReply("Fel format. Försök igen: `Namn, E-post, Telefon`");
        
        // REFACTOR: No longer uses fetch
        const newCustomer = await createCustomer({ name, email, phone, isCompany: false, ownerId: userId });
        return handleCustomerSelected(newCustomer.id, newCustomer.name, userId);
    }

    // 6. Select existing customer
    if (lastAssistantMessageContains(messages, "Hittade:")) {
        const customerName = lastUserMessage.content.replace(/\\[|\\]/g, '');
        // REFACTOR: No longer uses fetch
        const customers: Customer[] = await listCustomers(userId);
        const chosen = customers.find(c => c.name === customerName);
        if (!chosen) return sendReply(`Kunde inte hitta \"${customerName}\".`);
        return handleCustomerSelected(chosen.id, chosen.name, userId);
    }
    
    // 7. User wants to create a new project
    if (lastUserMessage.content === 'Skapa nytt projekt') {
        const customerName = extractDataFromMessage(messages, /kund \"(.*?)\"/);
        return sendReply(`Ok, vi skapar ett nytt projekt för kunden \"${customerName}\". Vilket namn ska projektet ha?`);
    }

    // 8. User has provided a project name
    if (lastAssistantMessageContains(messages, "Vilket namn ska projektet ha?")) {
        const newProjectName = lastUserMessage.content;
        const customerName = extractDataFromMessage(messages, /kunden \"(.*?)\"/);

        // REFACTOR: No longer uses fetch
        const customers: Customer[] = await listCustomers(userId);
        const customer = customers.find(c => c.name === customerName);

        if (!customer) {
            return sendReply(`Ett fel uppstod: Jag kunde inte hitta kund-ID för \"${customerName}\". Avbryter.`);
        }

        // REFACTOR: No longer uses fetch
        const newProject = await createProject({
            name: newProjectName,
            customerId: customer.id,
            customerName: customer.name,
            status: ProjectStatus.QUOTE,
            ownerId: userId
        });

        if (!newProject) {
            return sendReply(`Kunde inte skapa projektet. Försök igen.`);
        }
        
        return sendReply(`Projektet \"${newProject.name}\" har skapats åt kunden ${customer.name} och en Google Drive-mapp har skapats. Vad vill du göra nu?`);
    }

    // 9. Select existing project
    if (lastAssistantMessageContains(messages, "Vilket projekt gäller det?")) {
        const projectName = lastUserMessage.content.replace(/\\[|\\]/g, '');
        
        // REFACTOR: No longer uses fetch
        const projects: Project[] = await listProjects(userId);
        const project = projects.find(p => p.name === projectName);
        if (!project) return sendReply(`Hittade inte projekt \"${projectName}\".`);
        if (!project.driveFolderId) return sendReply(`Projekt \"${projectName}\" saknar en Drive-mapp.`);

        const files = await listFilesAndFolders(project.driveFolderId);
        let reply = files.length > 0 ? `Hittade filer... Vilka ska inkluderas?\n` + files.map(f => `\\[${f.name}\\]`).join(' ') : `Hittade inga filer.`;
        reply += `\n\n[Ingen av dessa] eller [Avbryt].`;
        return sendReply(reply);
    }

    // 10. Generate quote suggestion (Simulated AI)
    if (lastAssistantMessageContains(messages, "Vilka ska inkluderas?")) {
        const fileName = lastUserMessage.content.replace(/\\[|\\]/g, '');
        if (fileName === 'Ingen av dessa' || fileName === 'Avbryt') return sendReply("Ok, avbryter.");

        let summary = `Analyserar \"${fileName}\". Förslag:\n*   Rivning vägg: 8 tim\n*   Ny vägg: 16 tim\n*   Material: 5400 kr\n*   Avfall: 2 tim\n\nVill du \n[Spara och skicka] eller [Gör ändringar]?`;
        return sendReply(summary);
    }

    // Fallback
    return sendReply(`Jag är osäker på hur jag ska tolka \"${lastUserMessage.content}\".`);

  } catch (error) {
    console.error("Error in Orchestrator API: ", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
