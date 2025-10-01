
import { GoogleGenerativeAIStream, Message, StreamingTextResponse, streamToResponse } from 'ai';
import { GoogleGenerativeAI, FunctionDeclarationSchemaType } from '@google/generative-ai';
import { searchMemory, saveToMemory } from '@/app/services/vectorService';
// Importera de faktiska server-åtgärderna
import { createProject, getProjects } from '@/app/actions/projectActions';
import { getCustomers } from '@/app/actions/customerActions';

export const runtime = 'edge';

// --- 1. Definition av Verktyg --- 
const tools = {
  getProjects: {
    name: "getProjects",
    description: "Hämtar en lista över alla projekt för den aktuella användaren.",
    parameters: { 
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {},
      required: []
    }
  },
  createProject: {
    name: "createProject",
    description: "Skapar ett nytt projekt med namn, adress och kund-ID.",
    parameters: { 
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        name: { type: FunctionDeclarationSchemaType.STRING, description: "Projektets namn" },
        address: { type: FunctionDeclarationSchemaType.STRING, description: "Projektets adress" },
        customerId: { type: FunctionDeclarationSchemaType.STRING, description: "ID för kunden som projektet tillhör" },
        status: { type: FunctionDeclarationSchemaType.STRING, enum: ['active', 'completed', 'paused'], description: "Projektets status" }
      },
      required: ['name', 'address', 'customerId', 'status']
    }
  },
  getCustomers: {
    name: "getCustomers",
    description: "Hämtar en lista över alla kunder för den aktuella användaren.",
    parameters: { 
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {},
      required: []
    }
  }
};

// --- 2. Huvud-API-funktion --- 
export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Användar-ID saknas" }), { status: 400 });
    }

    const latestUserMessage = messages[messages.length - 1]?.content || '';
    const context = await searchMemory(latestUserMessage, 3);
    
    const systemPrompt = `Du är ByggPilot, en AI-assistent för ett byggföretag. Svara alltid på svenska. Använd följande kontext från kunskapsbasen: \n--- CONTEXT ---\n${context.join('\n')}\n--- END CONTEXT ---\nAnvänd de tillgängliga verktygen för att svara på användarens begäran. Om du inte kan uppfylla en begäran med ett verktyg, svara som en hjälpsam assistent.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', 
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

              // --- 3. Verktygsexekvering ---
              try {
                if (name === 'createProject') {
                  responsePayload = await createProject(args as any, userId);
                } else if (name === 'getProjects') {
                  responsePayload = await getProjects(userId);
                } else if (name === 'getCustomers') {
                  responsePayload = await getCustomers(userId);
                }
                 else {
                  responsePayload = { success: false, error: `Verktyget '${name}' hittades inte.` };
                }
              } catch (e: any) {
                responsePayload = { success: false, error: e.message };
              }
              
              toolResponses.push({ 
                name,
                response: responsePayload
              });
            }
            
            // Skicka tillbaka resultatet till modellen
            const result2 = await chat.sendMessageStream(JSON.stringify({ tool_responses: toolResponses }));
            for await (const chunk2 of result2.stream) {
                controller.enqueue(new TextEncoder().encode(chunk2.text));
            }

          } else if (chunk.text) {
            // Om det är ett vanligt text-svar
            controller.enqueue(new TextEncoder().encode(chunk.text));
          }
        }
        controller.close();
      }
    });

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error('[API_ROUTE_ERROR]', error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
