
import { Message } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getMemory, saveToMemory } from '@/app/services/memoryService';
import { createProject, getProjects } from '@/app/actions/projectActions';
// GULDSTANDARD: Importera createCustomer tillsammans med getCustomers
import { createCustomer, getCustomers } from '@/app/actions/customerActions';
import { createProjectFolderStructure } from '@/app/actions/driveActions';

const tools = {
  saveToMemory: {
    name: "saveToMemory",
    description: "Sparar en specifik bit text till det långsiktiga minnet. Använd detta när användaren explicit ber dig att komma ihåg eller lära dig något.",
    parameters: { 
      type: "OBJECT",
      properties: {
        textToSave: { type: "STRING", description: "Texten som ska sparas i minnet." }
      },
      required: ['textToSave']
    }
  },
  createProjectFolderStructure: {
    name: "createProjectFolderStructure",
    description: "Skapar den initiala mappstrukturen i användarens Google Drive.",
    parameters: { type: "OBJECT", properties: {}, required: [] }
  },
  getProjects: {
    name: "getProjects",
    description: "Hämtar en lista över alla projekt för den aktuella användaren.",
    parameters: { type: "OBJECT", properties: {}, required: [] }
  },
  createProject: {
    name: "createProject",
    description: "Skapar ett nytt projekt med namn, adress och kund-ID.",
    parameters: { 
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Projektets namn" },
        address: { type: "STRING", description: "Projektets adress" },
        customerId: { type: "STRING", description: "ID för kunden som projektet tillhör" },
        status: { type: "STRING", enum: ['active', 'completed', 'paused'], description: "Projektets status" }
      },
      required: ['name', 'address', 'customerId', 'status']
    }
  },
  // GULDSTANDARD: Lägg till det nya verktyget `createCustomer`
  createCustomer: {
    name: "createCustomer",
    description: "Skapar en ny kund (antingen privatperson eller företag).",
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Fullständigt namn på kunden." },
        email: { type: "STRING", description: "Kundens e-postadress." },
        phone: { type: "STRING", description: "Kundens telefonnummer." },
        address: { type: "STRING", description: "Kundens postadress." },
        orgNumber: { type: "STRING", description: "Organisationsnummer (om det är ett företag)." },
      },
      required: ['name']
    }
  },
  getCustomers: {
    name: "getCustomers",
    description: "Hämtar en lista över alla kunder för den aktuella användaren.",
    parameters: { type: "OBJECT", properties: {}, required: [] }
  }
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.uid) {
      return new Response(JSON.stringify({ error: "Autentisering krävs. Sessionen är ogiltig." }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    const { messages } = await req.json();

    const latestUserMessage = messages[messages.length - 1]?.content || '';
    
    const memoryContent = await getMemory();
    
    const systemPrompt = `Du är ByggPilot, en AI-assistent för ett byggföretag. Svara alltid på svenska.
Följande är ditt permanenta minne, sparat från tidigare konversationer i en fil. Använd det som din primära kunskapskälla för att ge personliga och kontextuella svar.

--- PERMANENT MINNE ---
${memoryContent}
--- SLUT PÅ MINNE ---

Använd de tillgängliga verktygen för att svara på användarens begäran.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest', 
      systemInstruction: systemPrompt,
      tools: [{ functionDeclarations: Object.values(tools) }]
    });

    const chat = model.startChat({ history: messages.map((msg: Message) => ({ role: msg.role === 'assistant' ? 'model' : msg.role, parts: [{ text: msg.content }] })) });
    const result = await chat.sendMessageStream(latestUserMessage);
    
    const stream = new ReadableStream({
      async pull(controller) {
        for await (const chunk of result.stream) {
          if (chunk.functionCalls) {
            const calls = chunk.functionCalls;
            const toolResponses = [];

            for (const call of calls) {
              const { name, args } = call;
              let responsePayload: any;

              try {
                if (name === 'saveToMemory') {
                  responsePayload = await saveToMemory(args.textToSave as string);
                } else if (name === 'createProjectFolderStructure') {
                  responsePayload = await createProjectFolderStructure();
                } else if (name === 'createProject') {
                  responsePayload = await createProject(args as any);
                } else if (name === 'getProjects') {
                  responsePayload = await getProjects();
                // GULDSTANDARD: Lägg till anropet för det nya verktyget
                } else if (name === 'createCustomer') {
                  responsePayload = await createCustomer(args as any);
                } else if (name === 'getCustomers') {
                  responsePayload = await getCustomers();
                } else {
                  responsePayload = { success: false, error: `Verktyget '${name}' hittades inte.` };
                }
              } catch (e: any) {
                responsePayload = { success: false, error: e.message };
              }
              
              toolResponses.push({ name, response: responsePayload });
            }
            
            const result2 = await chat.sendMessageStream(JSON.stringify({ tool_responses: toolResponses }));
            for await (const chunk2 of result2.stream) {
                if (chunk2.text) {
                  controller.enqueue(new TextEncoder().encode(chunk2.text));
                }
            }

          } else if (chunk.text) {
            controller.enqueue(new TextEncoder().encode(chunk.text));
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      }
    });

  } catch (error: any) {
    console.error('[CHAT_API_ROUTE_ERROR]', error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
