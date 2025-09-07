
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { ChatMessage, Customer, Project } from '@/app/types';
import { headers } from 'next/headers';
import { listFilesAndFolders } from '@/app/services/driveService';

// === Konversationsstatus-hjälpfunktioner ===
const lastAssistantMessageContains = (messages: ChatMessage[], text: string): boolean => {
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
    return lastAssistantMessage?.content.includes(text) || false;
};

const sendReply = (content: string) => {
    return NextResponse.json({ reply: { role: 'assistant', content } });
};

async function handleCustomerSelected(customerId: string, customerName: string, cookie: string, protocol: string, host: string) {
    const projectApiUrl = `${protocol}://${host}/api/projects/list?customerId=${customerId}`;
    const projects: Project[] = await (await fetch(projectApiUrl, { headers: { 'Cookie': cookie } })).json();
    let msg = `Ok, kund \"${customerName}\" är vald. `;
    if (projects.length > 0) {
        msg += `Vilket projekt gäller det?\\n` + projects.map(p => `\\[${p.name}\\]`).join(' ');
    } 
    msg += `\\n\\nAnnars kan du \\n[Skapa nytt projekt].`;
    return sendReply(msg);
}

/**
 * Orchestrator API
 */
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

    // Flöden baserat på konversationen...
    if (lastUserMessage.role !== 'user') {
        return sendReply("Jag väntar på ditt svar.");
    }

    // 1. Svar på kundfrågan
    if (lastAssistantMessageContains(messages, "För vilken kund?")) {
        const searchTerm = lastUserMessage.content;
        if (searchTerm === 'Skapa ny kund') return sendReply("Ok. Ange info: `Namn, E-post, Telefon`");
        if (searchTerm === 'Avbryt') return sendReply("Ok, jag avbryter.");

        const customers: Customer[] = await (await fetch(`${protocol}://${host}/api/customers/list`, { headers: { 'Cookie': cookie } })).json();
        const found = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        let reply = found.length > 0 ? `Hittade: \\n` + found.map(c => `\\[${c.name}\\]`).join(' ') : `Hittade inte "${searchTerm}".`;
        reply += "\\n\\n[Skapa ny kund] eller [Avbryt].";
        return sendReply(reply);
    }

    // 2. Skapa ny kund
    if (lastAssistantMessageContains(messages, "Ange info: `Namn, E-post, Telefon`")) {
        const [name, email, phone] = lastUserMessage.content.split(',').map((p: string) => p.trim());
        if (!name || !email) return sendReply("Fel format. Försök igen: `Namn, E-post, Telefon`");
        const newCustomer: Customer = await (await fetch(`${protocol}://${host}/api/customers/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }, body: JSON.stringify({ name, email, phone }) })).json();
        return handleCustomerSelected(newCustomer.id, newCustomer.name, cookie, protocol, host);
    }

    // 3. Välj befintlig kund
    if (lastAssistantMessageContains(messages, "Hittade:")) {
        const customerName = lastUserMessage.content.replace(/\\[|\\]/g, '');
        const customers: Customer[] = await (await fetch(`${protocol}://${host}/api/customers/list`, { headers: { 'Cookie': cookie } })).json();
        const chosen = customers.find(c => c.name === customerName);
        if (!chosen) return sendReply(`Kunde inte hitta \"${customerName}\".`);
        return handleCustomerSelected(chosen.id, chosen.name, cookie, protocol, host);
    }
    
    // 4. Välj projekt
    if (lastAssistantMessageContains(messages, "Vilket projekt gäller det?")) {
        const projectName = lastUserMessage.content.replace(/\\[|\\]/g, '');
        if (projectName === 'Skapa nytt projekt') return sendReply("Funktionen för att skapa nya projekt är inte implementerad än. Välj ett befintligt.");
        
        const projects: Project[] = await (await fetch(`${protocol}://${host}/api/projects/list`, { headers: { 'Cookie': cookie } })).json();
        const project = projects.find(p => p.name === projectName);
        if (!project) return sendReply(`Hittade inte projekt \"${projectName}\".`);
        if (!project.driveFolderId) return sendReply(`Projekt \"${projectName}\" saknar en Drive-mapp.`);

        const files = await listFilesAndFolders(project.driveFolderId);
        let reply = files.length > 0 ? `Hittade filer i projektmappen. Vilka ska inkluderas?\\n` + files.map(f => `\\[${f.name}\\]`).join(' ') : `Hittade inga filer.`;
        reply += `\\n\\n[Ingen av dessa] eller [Avbryt].`;
        return sendReply(reply);
    }

    // 5. Generera offertförslag (Simulerad AI)
    if (lastAssistantMessageContains(messages, "Vilka ska inkluderas?")) {
        const fileName = lastUserMessage.content.replace(/\\[|\\]/g, '');

        if (fileName === 'Ingen av dessa' || fileName === 'Avbryt') {
            return sendReply("Ok, jag avbryter. Du kan starta om flödet när du vill.");
        }

        // SIMULERING AV AI-ANALYS
        let summary = `Jag har analyserat \"${fileName}\". Baserat på det föreslår jag följande offertposter:\\n`;
        summary += `*   **Rivning av befintlig vägg:** 8 timmar\\n`;
        summary += `*   **Konstruktion av ny mellanvägg (2.5m x 4m):** 16 timmar\\n`;
        summary += `*   **Materialkostnad (gips, reglar, isolering):** ca 5 400 kr\\n`;
        summary += `*   **Bortforsling av byggavfall:** 2 timmar\\n\\n`;
        summary += `Detta är ett första utkast. Vill du \\n[Spara och skicka offerten] eller [Gör ändringar]?`;

        return sendReply(summary);
    }

    // Fallback
    return sendReply(`Jag är osäker på hur jag ska tolka "${lastUserMessage.content}".`);

  } catch (error) {
    console.error("Error in Orchestrator API: ", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
